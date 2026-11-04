import { NavLink } from "@/components/nav-link";
import { getCities } from "@/lib/cities";

export async function Nearby({ name, near }: { name: string; near: { slug: string; km: number }[] }) {
  if (near.length === 0) return null;
  const cities = await getCities(near.map((n) => n.slug));
  const km = new Map(near.map((n) => [n.slug, n.km]));
  return (
    <section aria-labelledby="nearby-h" className="bg-panel px-4 pb-10 text-p-ink md:px-10 md:pb-14">
      <div className="mx-auto max-w-[1160px]">
        <h2 id="nearby-h" className="text-xl font-semibold md:text-2xl">
          Weather near {name}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
          {cities.map((c) => {
            const d = km.get(c.slug) ?? 0;
            return (
              <li key={c.slug}>
                <NavLink
                  href={`/weather/${c.slug}`}
                  className="flex h-full flex-col gap-0.5 rounded-2xl bg-tile px-4 py-3 transition-[background-color] duration-200 hover:bg-rule"
                >
                  <span className="truncate font-semibold">{c.name}</span>
                  <span className="text-[13px] text-p-muted">
                    <span className="um">{d} km</span>
                    <span className="ui">{Math.round(d * 0.621)} mi</span> away
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
