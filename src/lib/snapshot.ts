import { cacheLife } from "next/cache";
import { DEFAULT_PLACES } from "@/data/default-places";
import { getCity, type City } from "./cities";
import type { Forecast } from "./forecast";
import { getForecast, loadForecast } from "./met";
import type { SceneKey } from "./scenes";

export type Snap = {
  slug: string;
  name: string;
  tz: string;
  temp: number;
  hi: number;
  lo: number;
  scene: SceneKey;
  sunHidden: boolean;
  condition: string;
  fetchedAt: string;
};

const toSnap = (city: City, f: Forecast): Snap => ({
  slug: city.slug,
  name: city.label,
  tz: city.tz,
  temp: f.now.temp,
  hi: f.range24.hi,
  lo: f.range24.lo,
  scene: f.sceneKey,
  sunHidden: f.sceneOpts.sunHidden,
  condition: f.condition,
  fetchedAt: f.fetchedAt,
});

export async function getSnap(slug: string): Promise<Snap | null> {
  const city = await getCity(slug);
  if (!city) return null;
  const f = await getForecast(slug);
  return f ? toSnap(city, f) : null;
}

export async function getDefaultSnaps(): Promise<Record<string, Snap>> {
  "use cache";
  const list = await Promise.all(
    DEFAULT_PLACES.map(async (p) => {
      try {
        const city = await getCity(p.slug);
        return city ? toSnap(city, await loadForecast(city)) : null;
      } catch {
        return null;
      }
    }),
  );
  const snaps = list.filter((s): s is Snap => s !== null);
  if (snaps.length === DEFAULT_PLACES.length) cacheLife({ stale: 300, revalidate: 900, expire: 604800 });
  else cacheLife({ stale: 60, revalidate: 300, expire: 604800 });
  return Object.fromEntries(snaps.map((s) => [s.slug, s]));
}
