import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import featured from "@/data/featured.json";
import { NavLink } from "@/components/nav-link";
import { PlacesApp } from "@/components/places/places-app";
import { SiteFooter } from "@/components/site-footer";
import { getDefaultSnaps } from "@/lib/snapshot";

export const metadata: Metadata = {
  title: "Saved places and city search",
  description: "Search any city with 15,000+ people and keep a list of places with their current weather and local time.",
  alternates: { canonical: "/places" },
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: "#0b1020" };

export default async function PlacesPage() {
  const seed = await getDefaultSnaps();
  return (
    <ViewTransition update="none">
      <style>{`:root{--sky:#0b1020;--ink:#f3efe6;--rule:rgba(243,239,230,0.12)}`}</style>
      <PlacesApp seed={seed} />
      <section aria-labelledby="popular-h" className="bg-night px-4 pb-10 text-night-ink md:px-10 md:pb-14">
        <div className="mx-auto max-w-[1160px]">
          <h2 id="popular-h" className="text-sm font-semibold text-night-muted">
            Popular destinations
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {featured.map((f) => (
              <li key={f.slug}>
                <NavLink
                  href={`/weather/${f.slug}`}
                  dir="forward"
                  className="flex h-9 items-center rounded-full bg-[rgba(243,239,230,0.06)] px-3.5 text-sm font-medium transition-[background-color] duration-200 hover:bg-[rgba(243,239,230,0.12)]"
                >
                  {f.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <SiteFooter tone="night" />
    </ViewTransition>
  );
}
