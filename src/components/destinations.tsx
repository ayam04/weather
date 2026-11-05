import featured from "@/data/featured.json";
import { NavLink } from "@/components/nav-link";

export function Destinations({ current }: { current: string }) {
  return (
    <section aria-labelledby="dest-h" className="bg-panel px-4 pb-10 text-p-ink md:px-10 md:pb-14">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="dest-h" className="text-xl font-semibold md:text-2xl">
            Explore destinations
          </h2>
          <NavLink href="/best-time-to-visit" dir="forward" className="text-[15px] font-semibold underline-offset-4 hover:underline">
            Best time to visit, month by month
          </NavLink>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {featured
            .filter((f) => f.slug !== current)
            .map((f) => (
              <li key={f.slug}>
                <NavLink
                  href={`/weather/${f.slug}`}
                  className="flex h-9 items-center rounded-full bg-tile px-3.5 text-sm font-medium transition-[background-color] duration-200 hover:bg-rule"
                >
                  {f.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
