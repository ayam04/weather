import featured from "@/data/featured.json";
import { NavLink } from "@/components/nav-link";
import { SITE } from "@/lib/site";

const LINKS = [
  ["/about", "About"],
  ["/data-sources", "Data sources"],
  ["/how-we-forecast", "How our pages work"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/contact", "Contact"],
] as const;

export function SiteFooter({ tone = "panel" }: { tone?: "panel" | "night" }) {
  const wrap = tone === "panel" ? "bg-panel text-p-ink" : "bg-night text-night-ink";
  const muted = tone === "panel" ? "text-p-muted" : "text-night-muted";
  return (
    <footer className={`${wrap} border-t border-rule px-4 pt-10 pb-12 md:px-10`}>
      <div className="mx-auto grid max-w-[1160px] gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-sm font-semibold">Popular destinations</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[15px] sm:grid-cols-3">
            {featured.map((f) => (
              <li key={f.slug}>
                <NavLink href={`/weather/${f.slug}`} className={`${muted} transition-colors duration-200 hover:text-current`}>
                  {f.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <nav aria-label="Site">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              {LINKS.map(([href, label]) => (
                <li key={href}>
                  <NavLink href={href} className="transition-opacity duration-200 hover:opacity-70">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className={`text-[13px] leading-relaxed ${muted}`}>
            Forecasts are computer model output from{" "}
            <a className="underline underline-offset-2" href="https://api.met.no/" rel="noopener">
              MET Norway
            </a>{" "}
            (CC BY 4.0), reformatted by us. They are not official warnings. For severe weather, follow your national weather service.
            Place names from{" "}
            <a className="underline underline-offset-2" href="https://www.geonames.org/" rel="noopener">
              GeoNames
            </a>
            . Climate averages from NOAA GHCN-Daily and NASA POWER.
          </p>
          <p className={`text-[13px] ${muted}`}>
            © {SITE.copyrightYear} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
