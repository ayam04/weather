"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { BackIcon, PinIcon, SearchIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { nearestCity, norm, prefetchShard, searchCities, type Match } from "@/lib/client-data";
import type { SceneKey } from "@/lib/scenes";
import { CARD, CardArt } from "./card-art";

type Place = { slug: string; name: string };
type Snap = { slug: string; name: string; tz: string; temp: number; hi: number; lo: number; scene: SceneKey; sunHidden: boolean; condition: string; fetchedAt: string };

const DEFAULTS: Place[] = [
  { slug: "london-gb", name: "London" },
  { slug: "new-york-city-us", name: "New York City" },
  { slug: "paris-fr", name: "Paris" },
  { slug: "tokyo-jp", name: "Tokyo" },
  { slug: "dubai-ae", name: "Dubai" },
];
const FRESH_MS = 30 * 60 * 1000;
const regionNames = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

const read = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

function useMinute() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      t = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return now;
}

function clockParts(tz: string, now: number) {
  const d = new Date(now);
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  const h12 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  const [hh, mm] = hm.split(":").map(Number);
  return { hm, h12, hA: ((hh % 12) + mm / 60) * 30, mA: mm * 6 };
}

const toF = (c: number) => Math.round((c * 9) / 5 + 32);
const noop = () => () => {};
const isClient = typeof window !== "undefined";

function applyUnits(u: "m" | "i") {
  document.documentElement.dataset.u = u;
  try {
    localStorage.setItem("u", u);
  } catch {}
}

function initialPlaces(): Place[] {
  if (!isClient) return [];
  const saved = read<Place[]>("places");
  return saved && saved.length ? saved : DEFAULTS;
}

function initialSnaps(): Record<string, Snap> {
  if (!isClient) return {};
  const out: Record<string, Snap> = {};
  const here = read<Place>("here");
  for (const p of [...(here ? [here] : []), ...initialPlaces()]) {
    const snap = read<Snap>(`snap:${p.slug}`);
    if (snap) out[p.slug] = snap;
  }
  return out;
}

export function PlacesApp() {
  const router = useRouter();
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [here, setHere] = useState<Place | null>(() => (isClient ? read<Place>("here") : null));
  const [snaps, setSnaps] = useState<Record<string, Snap>>(initialSnaps);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ q: string; list: Match[] }>({ q: "", list: [] });
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState(false);
  const [locating, setLocating] = useState<"idle" | "busy" | "denied">("idle");
  const now = useMinute();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (slug: string, force = false) => {
    const cached = read<Snap>(`snap:${slug}`);
    if (!force && cached && Date.now() - Date.parse(cached.fetchedAt) < FRESH_MS) return;
    try {
      const res = await fetch(`/api/now/${slug}`);
      if (!res.ok) return;
      const snap = (await res.json()) as Snap;
      write(`snap:${slug}`, snap);
      setSnaps((s) => ({ ...s, [slug]: snap }));
    } catch {}
  }, []);

  useEffect(() => {
    const h = read<Place>("here");
    [...(h ? [h] : []), ...initialPlaces()].forEach((p) => load(p.slug));
  }, [load]);

  useEffect(() => {
    let live = true;
    const term = q.split(",")[0];
    if (norm(term).trim().length < 2) return;
    searchCities(term, 6).then((list) => {
      if (!live) return;
      setFound({ q, list });
      setActive(0);
    });
    return () => {
      live = false;
    };
  }, [q]);

  const matches = useMemo(() => {
    if (found.q !== q) return found.list.length && q.startsWith(found.q) ? found.list : [];
    const have = new Set([...places.map((p) => p.slug), here?.slug]);
    return found.list.filter((x) => !have.has(x.slug));
  }, [found, q, places, here]);

  const persist = (list: Place[]) => {
    setPlaces(list);
    write("places", list);
  };

  const add = (m: Match) => {
    const next = [...places, { slug: m.slug, name: m.name }];
    persist(next);
    setQ("");
    load(m.slug);
    inputRef.current?.focus();
  };

  const remove = (slug: string) => persist(places.filter((p) => p.slug !== slug));

  const locate = () => {
    if (!("geolocation" in navigator)) return setLocating("denied");
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = await nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (!c) return setLocating("idle");
        const h = { slug: c.slug, name: c.name };
        setHere(h);
        write("here", h);
        document.cookie = `home=${c.slug}; Path=/; Max-Age=31536000; SameSite=Lax`;
        load(c.slug, true);
        setLocating("idle");
        router.prefetch("/");
      },
      () => setLocating("denied"),
      { maximumAge: 10 * 60 * 1000, timeout: 12_000 },
    );
  };


  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      add(matches[active]);
    } else if (e.key === "Escape") {
      setQ("");
    }
  };

  const cards = useMemo(() => [...(here ? [{ ...here, here: true }] : []), ...places.filter((p) => p.slug !== here?.slug).map((p) => ({ ...p, here: false }))], [here, places]);
  const searching = norm(q.split(",")[0]).trim().length >= 2;
  const qn = norm(q.split(",")[0]).trim();

  return (
    <div className="min-h-svh bg-night px-4 pt-4 pb-8 text-night-ink md:px-10 md:pt-8 md:pb-12">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-4">
        <header className="flex items-center gap-1" style={{ viewTransitionName: "site-header" }}>
          <NavLink href="/" dir="back" aria-label="Back to forecast" className="flex h-11 w-11 items-center justify-center rounded-full">
            <BackIcon />
          </NavLink>
          <h1 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">Places</h1>
          <div className="ml-auto flex items-center gap-2">
            <div role="group" aria-label="Units" className="flex h-9 rounded-full bg-[rgba(243,239,230,0.07)] p-1 text-sm font-semibold">
              {(["m", "i"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => applyUnits(u)}
                  className={`rounded-full px-3 text-night-muted transition-[background-color,color] duration-200 ${u === "m" ? "[html:not([data-u=i])_&]:bg-night-ink [html:not([data-u=i])_&]:text-night" : "[html[data-u=i]_&]:bg-night-ink [html[data-u=i]_&]:text-night"}`}
                >
                  {u === "m" ? "°C" : "°F"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="h-9 rounded-full px-3 text-sm font-semibold text-night-muted transition-colors duration-200 hover:text-night-ink"
            >
              {editing ? "Done" : "Edit"}
            </button>
          </div>
        </header>

        <div className="relative w-full max-w-[560px]">
          <label htmlFor="wx-city-search" className="sr-only">
            Search for a city
          </label>
          <span className="pointer-events-none absolute top-[15px] left-4 text-night-muted">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            id="wx-city-search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search a city"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              prefetchShard(e.target.value);
            }}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={searching}
            aria-controls={listId}
            aria-activedescendant={matches.length ? `${listId}-${active}` : undefined}
            className="h-12 w-full rounded-2xl border-0 bg-[rgba(243,239,230,0.07)] pr-4 pl-11 text-base text-night-ink outline-offset-2 placeholder:text-night-muted"
          />
        </div>

        {searching && (
          <div id={listId} role="listbox" aria-label="Matching cities" className="flex w-full max-w-[560px] animate-[wx-fade_180ms_ease_both] flex-col overflow-hidden rounded-[20px] bg-[rgba(243,239,230,0.04)]">
            {matches.map((m, i) => {
              const display = m.name;
              const idx = norm(display).startsWith(qn) ? qn.length : 0;
              const country = regionNames?.of(m.cc) ?? m.cc;
              return (
                <button
                  key={m.slug}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-label={`Add ${m.name}, ${m.region ? m.region + ", " : ""}${country}`}
                  onClick={() => add(m)}
                  onPointerEnter={() => setActive(i)}
                  className={`flex h-14 items-center justify-between gap-3 border-t border-[rgba(243,239,230,0.07)] pr-3 pl-5 text-left text-[17px] transition-colors duration-150 first:border-t-0 ${i === active ? "bg-[rgba(243,239,230,0.06)]" : ""}`}
                >
                  <span className="min-w-0 truncate">
                    <strong className="font-bold">{display.slice(0, idx)}</strong>
                    <span className="text-[#C9D1E0]">{display.slice(idx)}</span>
                    <span className="ml-2 text-sm text-night-muted">
                      {m.region && m.region !== m.name ? `${m.region}, ` : ""}
                      {country}
                    </span>
                  </span>
                  <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(243,239,230,0.08)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
              );
            })}
            {matches.length === 0 && <div className="flex h-14 items-center px-5 text-[15px] text-night-muted">No city by that name</div>}
          </div>
        )}

        {!here && ready && (
          <button
            type="button"
            onClick={locate}
            disabled={locating === "busy"}
            className="flex h-12 w-full max-w-[560px] items-center gap-2.5 rounded-2xl border border-dashed border-[rgba(243,239,230,0.18)] px-4 text-left text-[15px] text-night-muted transition-colors duration-200 hover:text-night-ink disabled:opacity-60"
          >
            <PinIcon size={15} />
            {locating === "busy" ? "Finding your location…" : locating === "denied" ? "Location is off. Search for your city instead" : "Use my precise location"}
          </button>
        )}

        <ul className="grid min-h-[110px] grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-2.5">
          {ready &&
            cards.map((c, i) => {
              const s = snaps[c.slug];
              const look = CARD[s?.scene ?? "night"];
              const clock = s && now ? clockParts(s.tz, now) : null;
              return (
                <li key={c.slug} className="relative enter" style={{ "--rise": "24px", "--delay": `${80 + i * 70}ms` } as CSSProperties}>
                  <NavLink
                    href={`/weather/${c.slug}`}
                    dir="forward"
                    aria-label={s ? `${c.name}, ${s.temp} degrees, ${s.condition.toLowerCase()}, local time ${clock?.hm}` : c.name}
                    className="relative grid h-[100px] grid-cols-[minmax(0,1fr)_auto] items-center overflow-hidden rounded-3xl px-5 no-underline transition-[background-color,transform] duration-500 active:scale-[0.985]"
                    style={{ background: s ? look.sky : "rgba(243,239,230,0.05)", color: look.ink }}
                  >
                    {s && <CardArt look={look} sunHidden={s.sunHidden} />}
                    <span className="relative flex min-w-0 flex-col gap-1.5">
                      <span className="flex items-center gap-1.5 text-lg font-semibold">
                        {c.here && <PinIcon size={14} />}
                        <span className="truncate" style={{ viewTransitionName: `city-${c.slug}` }}>
                          {c.name}
                        </span>
                      </span>
                      <span className="flex h-[18px] items-center gap-1.5 text-sm" style={{ color: look.muted }}>
                        {clock && (
                          <>
                            <svg role="img" aria-label="Local time" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="9.5" />
                              <line x1="12" y1="12" x2="12" y2="7.5" style={{ transform: `rotate(${clock.hA}deg)`, transformOrigin: "12px 12px" }} />
                              <line x1="12" y1="12" x2="12" y2="5" strokeWidth="1.6" style={{ transform: `rotate(${clock.mA}deg)`, transformOrigin: "12px 12px" }} />
                            </svg>
                            <span className="um">{clock.hm}</span>
                            <span className="ui">{clock.h12}</span>
                          </>
                        )}
                      </span>
                    </span>
                    <span
                      className="relative text-[40px] font-medium tracking-[-0.04em] transition-opacity duration-500"
                      style={{ opacity: s ? 1 : 0, viewTransitionName: s ? `temp-${c.slug}` : undefined }}
                    >
                      {s ? (
                        <>
                          <span className="um">{s.temp}°</span>
                          <span className="ui">{toF(s.temp)}°</span>
                        </>
                      ) : (
                        "0°"
                      )}
                    </span>
                  </NavLink>
                  {editing && !c.here && (
                    <button
                      type="button"
                      onClick={() => remove(c.slug)}
                      aria-label={`Remove ${c.name}`}
                      className="absolute -top-1.5 -right-1.5 flex h-7 w-7 animate-[wx-fade_160ms_ease_both] items-center justify-center rounded-full bg-night-ink text-night shadow"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
