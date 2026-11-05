import type { CSSProperties } from "react";
import { Precip, T } from "@/components/units";
import { Reveal } from "@/components/reveal";
import { MONTHS, rainTrusted, summarise, type Climate } from "@/lib/climate";

export function ClimateSection({ name, c }: { name: string; c: Climate }) {
  const rainOk = rainTrusted(c);
  const modelled = c.flags.includes("temps-modelled") || c.flags.includes("rain-modelled");
  const s = summarise(c);
  const lo0 = Math.min(...c.months.map((m) => m.lo));
  const hi0 = Math.max(...c.months.map((m) => m.hi));
  const span = Math.max(hi0 - lo0, 1);
  const rainMax = Math.max(...c.months.map((m) => m.rain), 1);
  const w = c.months[s.warmest];
  const k = c.months[s.coolest];
  const sameStation = c.tempStation === c.rainStation;
  const sourceLine = sameStation ? c.tempStation : `${c.tempStation} (temperature), ${c.rainStation} (rain)`;

  return (
    <section aria-labelledby="climate-h" className="bg-panel px-4 pt-6 pb-10 text-p-ink md:px-10 md:pt-4 md:pb-16">
      <div className="mx-auto max-w-[1160px]">
        <h2 id="climate-h" className="text-[26px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">
          {name} weather by month
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-p-muted md:text-base">
          Average daily highs and lows{rainOk ? ", rainfall and rainy days" : ""} for {c.period.replace("-", " to ")}, from {modelled ? "nearby weather-station records and a modelled climate grid" : "nearby weather-station records"}.
        </p>

        <Reveal className="mt-6 rounded-3xl bg-tile p-4 md:mt-8 md:p-6">
          <ol className="grid grid-cols-12 gap-1 md:gap-3" aria-label={`Monthly averages for ${name}`}>
            {c.months.map((m, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5 text-center">
                <span className="text-[11px] font-semibold md:text-sm">
                  <span className="md:hidden">{MONTHS[i][0]}</span>
                  <span className="hidden md:inline">{MONTHS[i].slice(0, 3)}</span>
                </span>
                <span className="text-[11px] font-semibold md:text-sm">
                  <T c={Math.round(m.hi)} />
                </span>
                <span className="relative h-24 w-1.5 rounded-[3px] bg-rule md:h-32">
                  <span
                    className="r-y absolute inset-x-0 rounded-[3px] bg-bar"
                    style={{ bottom: `${((m.lo - lo0) / span) * 100}%`, height: `${Math.max(((m.hi - m.lo) / span) * 100, 4)}%`, "--i": i } as CSSProperties}
                  />
                </span>
                <span className="text-[11px] text-p-muted md:text-sm">
                  <T c={Math.round(m.lo)} />
                </span>
                {rainOk && (
                  <>
                    <span className="mt-2 flex h-12 w-full items-end justify-center md:h-16">
                      <span
                        className="r-y w-2.5 rounded-[3px] bg-rain-bar md:w-4"
                        style={{ height: `${Math.max((m.rain / rainMax) * 100, 3)}%`, "--i": i } as CSSProperties}
                      />
                    </span>
                    <span className="text-[10px] text-p-muted md:text-xs">
                      <Precip mm={m.rain} unit={false} />
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-p-muted md:text-[13px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-1.5 rounded-sm bg-bar" /> Average high to low
            </span>
            {rainOk && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rain-bar" /> Rainfall, <span className="um">mm</span>
                <span className="ui">inches</span>
              </span>
            )}
          </div>
        </Reveal>

        <p className="mt-3 text-xs text-p-muted">
          Source: {c.source}. {sameStation ? "Station" : "Stations"}: {sourceLine}.
        </p>

        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2 md:gap-10">
          <div>
            <h3 className="text-xl font-semibold md:text-2xl">Best time to visit {name}</h3>
            <p className="mt-2 text-base leading-relaxed text-p-ink/85">
              {s.basis === "none" ? (
                <>
                  We don&apos;t recommend particular months for {name}. It is hot all year, and the local rainfall records did not pass our quality check, so we
                  can&apos;t reliably tell the dry season from the wet one.
                </>
              ) : (
                <>
                  Best months: <strong className="font-semibold">{s.best}</strong>.{" "}
                </>
              )}
              {s.basis === "comfortDry" && (
                <>
                  Average highs sit between <T c={18} /> and <T c={30} /> and rainy days are below the yearly middle.
                </>
              )}
              {s.basis === "comfort" && (
                <>
                  These months have average highs between <T c={18} /> and <T c={31} />.
                </>
              )}
              {s.basis === "warmest" && <>These are the warmest months, with the longest days.</>}
              {s.basis === "driest" && <>It is hot all year here, so these are simply the months with the fewest rainy days.</>}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[15px]">
            <div>
              <dt className="text-p-muted">Warmest month</dt>
              <dd className="font-semibold">
                {MONTHS[s.warmest]}, <T c={Math.round(w.hi)} /> / <T c={Math.round(w.lo)} />
              </dd>
            </div>
            <div>
              <dt className="text-p-muted">Coolest month</dt>
              <dd className="font-semibold">
                {MONTHS[s.coolest]}, <T c={Math.round(k.hi)} /> / <T c={Math.round(k.lo)} />
              </dd>
            </div>
            {rainOk && (
              <>
                <div>
                  <dt className="text-p-muted">Wettest month</dt>
                  <dd className="font-semibold">
                    {MONTHS[s.wettest]}, <Precip mm={c.months[s.wettest].rain} /> on about {Math.round(c.months[s.wettest].wet)} days
                  </dd>
                </div>
                <div>
                  <dt className="text-p-muted">Driest month</dt>
                  <dd className="font-semibold">
                    {MONTHS[s.driest]}, <Precip mm={c.months[s.driest].rain} />
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <details className="group mt-8 rounded-2xl bg-tile px-4 py-3 md:px-6">
          <summary className="cursor-pointer list-none py-1 text-[15px] font-semibold marker:hidden">
            <span className="inline-flex items-center gap-2">
              Monthly averages table
              <span aria-hidden className="transition-transform duration-300 group-open:rotate-180">⌄</span>
            </span>
          </summary>
          <div className="no-scrollbar mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">
                {name} monthly climate averages, {c.period}
              </caption>
              <thead className="text-p-muted">
                <tr>
                  <th className="py-2 pr-3 font-medium">Month</th>
                  <th className="py-2 pr-3 font-medium">Avg high</th>
                  <th className="py-2 pr-3 font-medium">Avg low</th>
                  {rainOk && <th className="py-2 pr-3 font-medium">Rainfall</th>}
                  {rainOk && <th className="py-2 font-medium">Rainy days</th>}
                </tr>
              </thead>
              <tbody>
                {c.months.map((m, i) => (
                  <tr key={i} className="border-t border-rule">
                    <th scope="row" className="py-2 pr-3 font-semibold">
                      {MONTHS[i]}
                    </th>
                    <td className="py-2 pr-3">
                      <T c={Math.round(m.hi)} />
                    </td>
                    <td className="py-2 pr-3">
                      <T c={Math.round(m.lo)} />
                    </td>
                    {rainOk && (
                      <td className="py-2 pr-3">
                        <Precip mm={m.rain} />
                      </td>
                    )}
                    {rainOk && <td className="py-2">{Math.round(m.wet)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
