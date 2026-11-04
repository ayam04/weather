"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

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
