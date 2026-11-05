import type { CSSProperties } from "react";
import { WxIcon } from "@/components/icons";
import { Clk, Precip, T } from "@/components/units";
import type { Hour } from "@/lib/forecast";

export function HoursStrip({ hours }: { hours: Hour[] }) {
  const wet = hours.some((h) => h.precip >= 0.2);
  return (
    <ol
      aria-label="Next 24 hours"
      className="no-scrollbar -mx-1 grid snap-x snap-mandatory auto-cols-[calc(100%/6)] grid-flow-col overflow-x-auto overscroll-x-contain text-center md:auto-cols-[calc(100%/8)]"
    >
      {hours.map((h, i) => (
        <li
          key={h.iso}
          className="enter-stagger flex snap-start flex-col items-center gap-2 md:gap-2.5"
          style={{ "--i": Math.min(i, 8) } as CSSProperties}
          aria-label={`${h.label ? h.label.h24 : "Now"}: ${h.temp}°C, ${h.condition}${h.precip >= 0.1 ? `, ${h.precip} mm` : ""}`}
        >
          <span className="text-[13px] text-p-muted md:text-sm">{h.label ? <Clk t={h.label} /> : "Now"}</span>
          <span className="flex h-[26px] w-[26px] md:h-7 md:w-7">
            <WxIcon icon={h.icon} size={26} stroke={1.6} />
          </span>
          <span className="text-[17px] font-semibold md:text-[19px]">
            <T c={h.temp} />
          </span>
          {wet && (
            <span className="h-3.5 text-[11px] leading-3.5 font-medium text-rain-bar">
              {h.precip >= 0.2 ? <Precip mm={h.precip} unit={false} /> : ""}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
