"use client";

import { useEffect, useRef, type ReactNode } from "react";

let io: IntersectionObserver | null = null;
const observer = () =>
  (io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.in = "";
        io?.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
  ));

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.in = "";
      return;
    }
    const o = observer();
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
