import { cacheLife } from "next/cache";
import { DEFAULT_PLACES } from "@/data/default-places";
import { getCity, type City } from "./cities";
import type { Forecast } from "./forecast";
import { getForecast } from "./met";
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

export const toSnap = (city: City, f: Forecast): Snap => ({
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
  cacheLife({ stale: 300, revalidate: 900, expire: 604800 });
  const list = await Promise.all(DEFAULT_PLACES.map((p) => getSnap(p.slug).catch(() => null)));
  return Object.fromEntries(list.filter((s): s is Snap => s !== null).map((s) => [s.slug, s]));
}
