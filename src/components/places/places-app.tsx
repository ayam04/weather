"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { BackIcon, PinIcon, SearchIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { DEFAULT_PLACES } from "@/data/default-places";
import { nearestCity, norm, prefetchShard, searchCities, type Match } from "@/lib/client-data";
import {
  age,
  FRESH_MS,
  getIdle,
  getIdleServer,
  getPlacesServerState,
  getPlacesState,
  loadDefaults,
  loadSnap,
  newer,
  SEED_TOLERANCE_MS,
  setFailed,
  setHere,
  setPlaces,
  subscribeIdle,
  subscribePlaces,
} from "@/lib/snap-store";
import type { Snap } from "@/lib/snapshot";
import { PlaceCard } from "./place-card";

const regionNames = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const noop = () => () => {};
const DEFAULT_SLUGS = new Set(DEFAULT_PLACES.map((p) => p.slug));

function applyUnits(u: "m" | "i") {
  document.documentElement.dataset.u = u;
  try {
    localStorage.setItem("u", u);
  } catch {}
}

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

export function PlacesApp({ seed }: { seed: Record<string, Snap> }) {
  const router = useRouter();
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const store = useSyncExternalStore(subscribePlaces, getPlacesState, getPlacesServerState);
  const idle = useSyncExternalStore(subscribeIdle, getIdle, getIdleServer);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ q: string; list: Match[] }>({ q: "", list: [] });
  const [active, setActive] = useState(0);
  const [pointed, setPointed] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [locating, setLocating] = useState<"idle" | "busy" | "denied">("idle");
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const now = useMinute();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const { places, here, snaps, failed } = store;

  const cards = useMemo(
    () => [
      ...(here ? [{ ...here, isHere: true }] : []),
      ...places.filter((p) => p.slug !== here?.slug).map((p) => ({ ...p, isHere: false })),
    ],
    [here, places],
  );

  useEffect(() => {
    if (!ready) return;
    const staleDefaults: string[] = [];
    for (const c of cards) {
      const best = newer(snaps[c.slug], seed[c.slug]);
      const fromSeed = !!best && best === seed[c.slug] && best !== snaps[c.slug];
      if (age(best) < (fromSeed ? SEED_TOLERANCE_MS : FRESH_MS)) continue;
      if (DEFAULT_SLUGS.has(c.slug)) staleDefaults.push(c.slug);
      else void loadSnap(c.slug);
    }
    if (staleDefaults.length > 1) void loadDefaults();
    else staleDefaults.forEach((slug) => void loadSnap(slug));
  }, [ready, cards, snaps, seed]);

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

  useEffect(() => {
    if (!pointed) return;
    const t = setTimeout(() => void loadSnap(pointed), 140);
    return () => clearTimeout(t);
  }, [pointed]);

  const add = (m: Match) => {
    setPlaces([...places, { slug: m.slug, name: m.name }]);
    setFresh((s) => new Set(s).add(m.slug));
    setQ("");
    setPointed(null);
    void loadSnap(m.slug);
    inputRef.current?.focus();
  };

  const remove = (slug: string) => setPlaces(places.filter((p) => p.slug !== slug));

  const locate = () => {
    if (!("geolocation" in navigator)) return setLocating("denied");
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = await nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (!c) return setLocating("idle");
        setHere({ slug: c.slug, name: c.name, source: "gps" });
        document.cookie = `home=${c.slug}; Path=/; Max-Age=31536000; SameSite=Lax`;
        void loadSnap(c.slug);
        setLocating("idle");
        router.prefetch("/");
      },
      () => setLocating("denied"),
      { maximumAge: 10 * 60 * 1000, timeout: 12_000 },
    );
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!matches.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      setActive(next);
      setPointed(matches[next].slug);
    } else if (e.key === "Enter") {
      e.preventDefault();
      add(matches[active]);
    } else if (e.key === "Escape") {
      setQ("");
      setPointed(null);
    }
  };

  const qn = norm(q.split(",")[0]).trim();
  const searching = qn.length >= 2;

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
              setPointed(null);
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
          <div
            id={listId}
            role="listbox"
            aria-label="Matching cities"
            className="flex w-full max-w-[560px] animate-[wx-fade_180ms_ease_both] flex-col overflow-hidden rounded-[20px] bg-[rgba(243,239,230,0.04)]"
          >
            {matches.map((m, i) => {
              const idx = norm(m.name).startsWith(qn) ? qn.length : 0;
              const country = regionNames?.of(m.cc) ?? m.cc;
              return (
                <button
                  key={m.slug}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-label={`Add ${m.name}, ${m.region ? m.region + ", " : ""}${country}`}
                  onClick={() => add(m)}
                  onPointerEnter={() => {
                    setActive(i);
                    setPointed(m.slug);
                  }}
                  className={`flex h-14 items-center justify-between gap-3 border-t border-[rgba(243,239,230,0.07)] pr-3 pl-5 text-left text-[17px] transition-colors duration-150 first:border-t-0 ${i === active ? "bg-[rgba(243,239,230,0.06)]" : ""}`}
                >
                  <span className="min-w-0 truncate">
                    <strong className="font-bold">{m.name.slice(0, idx)}</strong>
                    <span className="text-[#C9D1E0]">{m.name.slice(idx)}</span>
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
            {matches.length === 0 && found.q === q && <div className="flex h-14 items-center px-5 text-[15px] text-night-muted">No city by that name</div>}
          </div>
        )}

        {ready && here?.source !== "gps" && (
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
              const snap = newer(snaps[c.slug], seed[c.slug]) ?? undefined;
              return (
                <PlaceCard
                  key={c.slug}
                  slug={c.slug}
                  name={c.name}
                  here={c.isHere}
                  snap={snap}
                  failed={!snap && !!failed[c.slug]}
                  now={now}
                  index={i}
                  added={fresh.has(c.slug)}
                  eager={(idle && i < 8) || fresh.has(c.slug)}
                  editing={editing}
                  onRemove={c.isHere ? undefined : () => remove(c.slug)}
                  onRetry={() => {
                    setFailed(c.slug, false);
                    void loadSnap(c.slug, true);
                  }}
                />
              );
            })}
        </ul>
      </div>
    </div>
  );
}
