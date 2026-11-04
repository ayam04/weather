"use client";

import { useLayoutEffect, useRef } from "react";
import { toF } from "./units";

export function CountUp({ to, from }: { to: number; from: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = el.closest(".enter") as HTMLElement | null;
    const anim = host?.getAnimations()[0];
    const elapsed = anim && typeof anim.currentTime === "number" ? anim.currentTime : 0;
    if (elapsed > 140) return;
    const imperial = document.documentElement.dataset.u === "i";
    const end = imperial ? toF(to) : to;
    const start = imperial ? toF(from) : from;
    const node = el.querySelector(imperial ? ".ui" : ".um");
    if (!node) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
      const v = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3)));
      node.textContent = `${v}°`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    node.textContent = `${start}°`;
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      node.textContent = `${end}°`;
    };
  }, [to, from]);

  return (
    <span ref={ref}>
      <span className="um">{to}°</span>
      <span className="ui">{toF(to)}°</span>
    </span>
  );
}
