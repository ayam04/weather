import type { Metadata, Viewport } from "next";
import { ViewTransition, type CSSProperties } from "react";
import { BackIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { RootVars } from "@/components/root-vars";
import { SiteFooter } from "@/components/site-footer";
import { Precip, T } from "@/components/units";
import { FEATURED_LABEL, FEATURED_SLUGS } from "@/lib/cities";
import { getAllClimates, MONTHS, rainTrusted, summarise, type Climate } from "@/lib/climate";
import { jsonLd } from "@/lib/seo";
import { NIGHT_SKY, NIGHT_VARS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Best time to visit: weather by month",
  description:
    "Where to go each month, from London to Bali: average highs, rainfall and the best months for 25 popular destinations, calculated from weather-station records for 2015 to 2024.",
  alternates: { canonical: "/best-time-to-visit" },
};

export const viewport: Viewport = { themeColor: NIGHT_SKY };

function heat(c: number) {
  const t = Math.max(0, Math.min(1, (c + 5) / 45));
  const hue = 220 - t * 200;
  return `hsl(${hue} 55% ${28 + t * 10}% / 0.85)`;
}

function warmDry(c: Climate, m: number) {
  const x = c.months[m];
  return x.hi >= 24 && rainTrusted(c) && x.wet <= 6;
}

export default async function BestTimePage() {
  const climates = await getAllClimates(FEATURED_SLUGS);
  const rows = climates.map(([slug, c]) => ({ slug, name: FEATURED_LABEL.get(slug) ?? slug, c, s: summarise(c) }));
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Weather", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Best time to visit", item: `${SITE.url}/best-time-to-visit` },
    ],
  };

  return (
    <ViewTransition update="none">
      <RootVars css={NIGHT_VARS} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <div className="min-h-svh bg-night px-4 pt-4 pb-14 text-night-ink md:px-10 md:pt-8">
        <div className="mx-auto max-w-[1160px]">
          <header className="flex items-center gap-1" style={{ viewTransitionName: "site-header" }}>
            <NavLink href="/" dir="back" aria-label="Back to forecast" className="flex h-11 w-11 items-center justify-center rounded-full">
              <BackIcon />
            </NavLink>
            <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
              <NavLink href="/" className="hover:text-night-ink">
                Weather
              </NavLink>
              <span aria-hidden> / </span>
              <span aria-current="page">Best time to visit</span>
            </nav>
          </header>

          <h1 className="mt-6 max-w-3xl text-[34px] leading-tight font-semibold tracking-[-0.02em] md:text-[48px]">Best time to visit: 25 destinations, month by month</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-night-ink/85">
            Average highs, rainfall and the best months for each place, calculated from daily weather-station records for 2015 to 2024. Pick a month to see where
            the weather is on your side.
          </p>

          <section aria-labelledby="months-h" className="mt-12">
            <h2 id="months-h" className="text-2xl font-semibold md:text-3xl">
              Where to go each month
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MONTHS.map((month, m) => {
                const best = rows.filter((r) => r.s.bestMonths.includes(m));
                const warm = rows.filter((r) => warmDry(r.c, m) && !r.s.bestMonths.includes(m));
                return (
                  <article key={month} id={month.toLowerCase()} className="scroll-mt-6 rounded-3xl bg-[rgba(243,239,230,0.05)] p-5">
                    <h3 className="text-xl font-semibold">{month}</h3>
                    {best.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {best.map((r) => (
                          <li key={r.slug}>
                            <NavLink
                              href={`/weather/${r.slug}`}
                              className="flex h-8 items-center gap-1.5 rounded-full bg-[rgba(243,239,230,0.08)] px-3 text-sm font-medium transition-[background-color] duration-200 hover:bg-[rgba(243,239,230,0.16)]"
                            >
                              {r.name}
                              <span className="text-night-muted">
                                <T c={Math.round(r.c.months[m].hi)} />
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-night-muted">No destination here has its best weather in {month}.</p>
                    )}
                    {warm.length > 0 && (
                      <p className="mt-3 text-sm text-night-muted">
                        Also warm and fairly dry: {warm.map((r) => r.name).join(", ")}.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="table-h" className="mt-14">
            <h2 id="table-h" className="text-2xl font-semibold md:text-3xl">
              Average daily high by month
            </h2>
            <div className="no-scrollbar mt-5 overflow-x-auto rounded-3xl bg-[rgba(243,239,230,0.04)]">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <caption className="sr-only">Average daily high temperature by month for 25 destinations, 2015 to 2024</caption>
                <thead>
                  <tr className="text-night-muted">
                    <th scope="col" className="sticky left-0 bg-night px-4 py-3 text-left font-medium">
                      Destination
                    </th>
                    {MONTHS.map((m) => (
                      <th key={m} scope="col" className="px-1 py-3 font-medium">
                        {m.slice(0, 3)}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3 text-left font-medium">
                      Best months
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.slug} className="border-t border-[rgba(243,239,230,0.07)]">
                      <th scope="row" className="sticky left-0 bg-night px-4 py-2 text-left font-semibold whitespace-nowrap">
                        <NavLink href={`/weather/${r.slug}`} className="hover:underline">
                          {r.name}
                        </NavLink>
                      </th>
                      {r.c.months.map((x, i) => (
                        <td key={i} className="px-0.5 py-1.5 text-center">
                          <span
                            className={`inline-flex h-8 w-12 items-center justify-center rounded-lg font-medium ${r.s.bestMonths.includes(i) ? "ring-2 ring-[#F1E6C8]/80" : ""}`}
                            style={{ background: heat(x.hi) } as CSSProperties}
                          >
                            <T c={Math.round(x.hi)} />
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-2 whitespace-nowrap text-night-muted">{r.s.best || "Not enough reliable rain data"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-night-muted">A ring marks the best months for that destination.</p>
          </section>

          <section aria-labelledby="rain-h" className="mt-14">
            <h2 id="rain-h" className="text-2xl font-semibold md:text-3xl">
              Rainfall by month
            </h2>
            <div className="no-scrollbar mt-5 overflow-x-auto rounded-3xl bg-[rgba(243,239,230,0.04)]">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <caption className="sr-only">Average monthly rainfall for 25 destinations, 2015 to 2024</caption>
                <thead>
                  <tr className="text-night-muted">
                    <th scope="col" className="sticky left-0 bg-night px-4 py-3 text-left font-medium">
                      Destination
                    </th>
                    {MONTHS.map((m) => (
                      <th key={m} scope="col" className="px-1 py-3 font-medium">
                        {m.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const ok = rainTrusted(r.c);
                    const max = Math.max(...r.c.months.map((x) => x.rain), 1);
                    return (
                      <tr key={r.slug} className="border-t border-[rgba(243,239,230,0.07)]">
                        <th scope="row" className="sticky left-0 bg-night px-4 py-2 text-left font-semibold whitespace-nowrap">
                          {r.name}
                        </th>
                        {r.c.months.map((x, i) => (
                          <td key={i} className="px-1 py-1.5 text-center text-xs">
                            {ok ? (
                              <span className="flex flex-col items-center gap-1">
                                <span className="block w-6 rounded-sm bg-[#7FA8D1]" style={{ height: `${Math.max((x.rain / max) * 28, 2)}px` }} />
                                <Precip mm={x.rain} unit={false} />
                              </span>
                            ) : (
                              <span className="text-night-muted">–</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-night-muted">
              Millimetres, or inches if you chose °F. A dash means the station&apos;s rainfall records did not pass our quality check.
            </p>
          </section>

          <section aria-labelledby="method-h" className="mt-14 max-w-3xl">
            <h2 id="method-h" className="text-2xl font-semibold md:text-3xl">
              How these numbers are made
            </h2>
            <div className="mt-4 flex flex-col gap-4 text-[16px] leading-relaxed text-night-ink/85">
              <p>
                For each destination we use daily observations from the nearest long-running weather station in NOAA&apos;s Global Historical Climatology Network
                (GHCN-Daily) and average every day from 2015 to 2024. Where no station had enough records, we use NASA&apos;s POWER climate grid instead, and each
                destination page says which source and station it uses.
              </p>
              <p>
                Best months are those with average highs between 18°C and 30°C (64°F to 86°F) and fewer rainy days than the place&apos;s yearly middle. Where it
                is hot all year, they are the four months with the fewest rainy days; where it is never that warm, the three warmest months. If a hot place&apos;s
                rainfall records fail our quality check, we make no recommendation. &ldquo;Warm and fairly dry&rdquo; means an average high of at least 24°C and no
                more than six rainy days.
              </p>
              <p>
                <a className="underline underline-offset-2" href="/best-time-to-visit/climate.csv" download>
                  Download the full data as CSV
                </a>{" "}
                (monthly highs, lows, rainfall and rainy days for all 25 destinations). You can reuse it under{" "}
                <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by/4.0/" rel="noopener license">
                  CC BY 4.0
                </a>
                : please credit &ldquo;weather.ayamk.in, from NOAA GHCN-Daily and NASA POWER&rdquo;.
              </p>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter tone="night" />
    </ViewTransition>
  );
}
