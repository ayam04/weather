import { ArrowIcon } from "@/components/icons";
import { CountUp } from "@/components/count-up";
import { LocalTime } from "@/components/local-time";
import { T } from "@/components/units";
import type { Forecast } from "@/lib/forecast";

export function Hero({ f, slug, name }: { f: Forecast; slug: string; name: string }) {
  return (
    <div className="flex h-[calc(100svh-300px)] min-h-[300px] flex-col justify-end px-6 pb-6 md:h-auto md:min-h-0 md:flex-[1_1_360px] md:px-0 md:pb-0">
      <h1 className="sr-only">
        {name} weather: {f.condition}, {f.now.temp}°C
      </h1>
      <div className="enter">
        <div className="px-temp flex origin-bottom-left flex-col gap-2.5 md:gap-3.5 md:[--temp-range:420px]">
          <div
            className="-ml-1.5 text-[148px] leading-[0.82] font-medium tracking-[-0.05em] [font-variation-settings:'opsz'_96] md:-ml-2.5 md:text-[clamp(140px,17vw,260px)] md:leading-[0.8]"
            style={{ viewTransitionName: `temp-${slug}` }}
          >
            <CountUp to={f.now.temp} from={f.range24.lo - 4} />
          </div>
          <div className="flex items-center gap-4 text-lg font-semibold md:gap-5 md:text-[22px]">
            <span className="flex items-center gap-1">
              <ArrowIcon dir="up" size={16} />
              <T c={f.range24.hi} />
            </span>
            <span className="flex items-center gap-1 opacity-75">
              <ArrowIcon dir="down" size={16} />
              <T c={f.range24.lo} />
            </span>
            <span className="sr-only">over the next 24 hours</span>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-medium opacity-80 md:text-[17px]">
            <span>{f.condition}</span>
            <span aria-hidden>·</span>
            <LocalTime tz={f.tz} />
          </p>
        </div>
      </div>
    </div>
  );
}
