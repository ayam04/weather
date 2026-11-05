"use client";

import { useLayoutEffect, useRef } from "react";

export function RootVars({ css }: { css: string }) {
  const ref = useRef<HTMLStyleElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      el.media = el.style.display === "none" ? "not all" : "all";
    };
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(el, { attributeFilter: ["style"] });
    return () => {
      watch.disconnect();
      el.media = "not all";
    };
  }, []);
  return <style ref={ref}>{`:root{${css}}`}</style>;
}
