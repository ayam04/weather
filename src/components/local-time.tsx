"use client";

import { useEffect, useState } from "react";

function parts(tz: string, d: Date) {
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).format(d);
  const h24 = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  const h12 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  return { day, h24, h12 };
}

export function LocalTime({ tz }: { tz: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      t = setTimeout(tick, 60_000 - (d.getTime() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  if (!now) return <span className="inline-block min-w-[7ch] opacity-0">00:00</span>;
  const p = parts(tz, now);
  return (
    <span className="animate-[wx-fade_400ms_ease_both]">
      <span className="sr-only">Local time </span>
      {`${p.day} `}
      <span className="um">{p.h24}</span>
      <span className="ui">{p.h12}</span>
    </span>
  );
}
