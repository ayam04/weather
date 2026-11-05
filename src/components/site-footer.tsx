import { NavLink } from "@/components/nav-link";
import { SITE } from "@/lib/site";

const LINKS = [
  ["/about", "About"],
  ["/data-sources", "Data sources"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/contact", "Contact"],
] as const;

export function SiteFooter({ tone = "panel" }: { tone?: "panel" | "night" }) {
  const wrap = tone === "panel" ? "bg-panel text-p-ink" : "bg-night text-night-ink";
  const muted = tone === "panel" ? "text-p-muted" : "text-night-muted";
  return (
    <footer className={`${wrap} border-t border-rule px-4 py-8 md:px-10`}>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
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
        <p className={`text-[13px] ${muted}`}>
          Forecasts: <a className="underline underline-offset-2" href="https://api.met.no/" rel="noopener">MET Norway</a>, <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by/4.0/" rel="noopener license">CC BY 4.0</a>, reformatted. Not official warnings. © {SITE.copyrightYear}
        </p>
      </div>
    </footer>
  );
}
