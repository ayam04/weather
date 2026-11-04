"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_PLACES } from "@/data/default-places";
import { getPlacesState, goodConnection, loadSnap, whenIdle } from "@/lib/snap-store";

const STALE_MS = 35 * 60 * 1000;

export function MotionRuntime() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;
    const root = document.documentElement;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--y", String(Math.min(window.scrollY, 1200)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () =>
      document.querySelectorAll<SVGSVGElement>("svg").forEach((s) => (mq.matches ? s.pauseAnimations?.() : s.unpauseAnimations?.()));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/places" || !goodConnection()) return;
    return whenIdle(() => {
      const defaults = new Set(DEFAULT_PLACES.map((p) => p.slug));
      const { here, places } = getPlacesState();
      const own = [...(here ? [here] : []), ...places].filter((p) => !defaults.has(p.slug)).slice(0, 12);
      own.forEach((p, i) => setTimeout(() => void loadSnap(p.slug), i * 150));
    }, 4000);
  }, [pathname]);

  useEffect(() => {
    const t = setTimeout(() => {
      const stamp = document.querySelector<HTMLElement>("[data-fetched-at]")?.dataset.fetchedAt;
      if (document.visibilityState === "visible" && stamp && Date.now() - Date.parse(stamp) > STALE_MS) router.refresh();
    }, 2500);
    return () => clearTimeout(t);
  }, [pathname, router]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const stamp = document.querySelector<HTMLElement>("[data-fetched-at]")?.dataset.fetchedAt;
      if (stamp && Date.now() - Date.parse(stamp) > STALE_MS) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return null;
}
