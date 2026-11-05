"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { PinIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { toF } from "@/components/units";
import type { Snap } from "@/lib/snapshot";
import { CARD, CardArt } from "./card-art";

const revealed = new Set<string>();

function clockParts(tz: string, now: number) {
  const d = new Date(now);
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  const h12 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  const [hh, mm] = hm.split(":").map(Number);
  return { hm, h12, hA: ((hh % 12) + mm / 60) * 30, mA: mm * 6 };
}

type Props = {
  slug: string;
  name: string;
  here: boolean;
  snap: Snap | undefined;
  failed: boolean;
  now: number;
  index: number;
  added: boolean;
  eager: boolean;
  editing: boolean;
  onRemove?: () => void;
  onRetry?: () => void;
};

export function PlaceCard({ slug, name, here, snap, failed, now, index, added, eager, editing, onRemove, onRetry }: Props) {
  const look = snap ? CARD[snap.scene] : null;
  const clock = snap && now ? clockParts(snap.tz, now) : null;
  const loading = !snap && !failed;
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!added || revealed.has(slug) || !ref.current) return;
    revealed.add(slug);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    const id = requestAnimationFrame(() => el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }));
    return () => cancelAnimationFrame(id);
  }, [added, slug]);

  return (
    <li ref={ref} className="enter relative scroll-mb-6" style={{ "--rise": added ? "12px" : "24px", "--delay": added ? "0ms" : `${Math.min(index, 8) * 70 + 80}ms` } as CSSProperties}>
      <NavLink
        href={`/weather/${slug}`}
        dir="forward"
        eager={eager}
        aria-busy={loading}
        aria-label={snap ? `${name}, ${snap.temp} degrees, ${snap.condition.toLowerCase()}, local time ${clock?.hm ?? ""}` : failed ? `${name}, weather unavailable` : `${name}, loading weather`}
        className="relative grid h-[100px] grid-cols-[minmax(0,1fr)_auto] items-center overflow-hidden rounded-3xl px-5 no-underline transition-[background-color,color] duration-500 active:scale-[0.985]"
        style={{ background: look ? look.sky : "rgba(243,239,230,0.05)", color: look ? look.ink : "#F3EFE6" }}
      >
        {loading && <span aria-hidden className="wx-shimmer pointer-events-none absolute inset-0" />}
        {snap && look && (
          <span className="absolute inset-0 animate-[wx-fade_500ms_ease_both]">
            <CardArt look={look} sunHidden={snap.sunHidden} />
          </span>
        )}
        <span className="relative flex min-w-0 flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-lg font-semibold">
            {here && <PinIcon size={14} />}
            <span className="truncate" style={{ viewTransitionName: `city-${slug}` }}>
              {name}
            </span>
          </span>
          <span className="flex h-[18px] items-center gap-1.5 text-sm" style={{ color: look ? look.muted : "#9AA6BF" }}>
            {clock ? (
              <span className="flex animate-[wx-fade_400ms_ease_both] items-center gap-1.5">
                <svg role="img" aria-label="Local time" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9.5" />
                  <line x1="12" y1="12" x2="12" y2="7.5" style={{ transform: `rotate(${clock.hA}deg)`, transformOrigin: "12px 12px" }} />
                  <line x1="12" y1="12" x2="12" y2="5" strokeWidth="1.6" style={{ transform: `rotate(${clock.mA}deg)`, transformOrigin: "12px 12px" }} />
                </svg>
                <span className="um">{clock.hm}</span>
                <span className="ui">{clock.h12}</span>
              </span>
            ) : failed ? (
              <span>Couldn&apos;t load</span>
            ) : (
              <span aria-hidden className="wx-bone h-3 w-16 rounded-full" />
            )}
          </span>
        </span>
        <span className="relative text-[40px] font-medium tracking-[-0.04em]">
          {snap ? (
            <span className="block animate-[wx-fade_500ms_ease_both]" style={{ viewTransitionName: `temp-${slug}` }}>
              <span className="um">{snap.temp}°</span>
              <span className="ui">{toF(snap.temp)}°</span>
            </span>
          ) : failed ? (
            <span aria-hidden className="text-night-muted">–</span>
          ) : (
            <span aria-hidden className="wx-bone block h-9 w-[72px] rounded-2xl" />
          )}
        </span>
      </NavLink>
      {failed && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="absolute top-1/2 right-16 -translate-y-1/2 rounded-full bg-[rgba(243,239,230,0.1)] px-3 py-1.5 text-xs font-semibold text-night-ink transition-[background-color] duration-200 hover:bg-[rgba(243,239,230,0.18)]"
        >
          Retry
        </button>
      )}
      {editing && !here && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="absolute -top-1.5 -right-1.5 flex h-7 w-7 animate-[wx-fade_160ms_ease_both] items-center justify-center rounded-full bg-night-ink text-night shadow"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </li>
  );
}
