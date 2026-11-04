import type { CSSProperties } from "react";
import { WxIcon } from "@/components/icons";
import { Precip, T } from "@/components/units";
import type { Day } from "@/lib/forecast";

export function DaysList({ days }: { days: Day[] }) {
  const lo0 = Math.min(...days.map((d) => d.lo));
  const hi0 = Math.max(...days.map((d) => d.hi));
  const span = Math.max(hi0 - lo0, 1);
  return (
    <ol
      aria-label={`Next ${days.length} days`}
      className="flex flex-col md:grid md:grid-flow-col md:auto-cols-fr md:text-center"
    >
      {days.map((d, i) => {
        const a = ((d.lo - lo0) / span) * 100;
        const w = Math.max(((d.hi - d.lo) / span) * 100, 4);
        return (
          <li
            key={d.key}
            title={d.long}
            className="grid h-10 grid-cols-[48px_28px_42px_30px_minmax(0,1fr)_30px] items-center gap-x-2.5 px-2 text-[15px] md:flex md:h-auto md:flex-col md:gap-2 md:px-0"
            aria-label={`${d.long}: ${d.condition}, high ${d.hi}°C, low ${d.lo}°C${d.precip >= 0.5 ? `, ${d.precip} mm rain` : ""}`}
          >
            <span className="font-semibold md:order-1 md:text-sm">{d.label}</span>
            <span className="flex h-[22px] w-[22px] md:order-2 md:h-6 md:w-6">
              <WxIcon icon={d.icon} size={22} stroke={1.7} label={false} />
            </span>
            <span className="text-right text-xs font-medium text-rain-bar md:order-6 md:h-4 md:text-center">
              {d.precip >= 0.5 ? <Precip mm={d.precip} /> : ""}
            </span>
            <span className="text-right text-p-muted md:order-5 md:text-center">
              <T c={d.lo} />
            </span>
            <span
              className="relative h-1.5 rounded-[3px] bg-rule md:order-4 md:h-[72px] md:w-1.5"
              style={{ "--a": `${a}%`, "--w": `${w}%`, "--i": i } as CSSProperties}
            >
              <span className="grow-xy absolute inset-y-0 left-(--a) w-(--w) rounded-[3px] bg-bar md:inset-x-0 md:top-auto md:bottom-(--a) md:left-0 md:h-(--w) md:w-auto" />
            </span>
            <span className="font-semibold md:order-3 md:text-base">
              <T c={d.hi} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
