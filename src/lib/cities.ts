import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import featured from "@/data/featured.json";

type RawCity = [number, string, string, string, number, number, string, number, [string, number][]];

export type City = {
  slug: string;
  id: number;
  name: string;
  label: string;
  cc: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  tz: string;
  pop: number;
  near: { slug: string; km: number }[];
  featured: boolean;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export const countryName = (cc: string) => {
  try {
    return regionNames.of(cc) ?? cc;
  } catch {
    return cc;
  }
};

const FEATURED = new Map(featured.map((f) => [f.slug, f.label]));
export const FEATURED_SLUGS = featured.map((f) => f.slug);
export const PRERENDER = (process.env.PRERENDER_SLUGS ?? "london-gb").split(",").filter(Boolean);
export const isFeatured = (slug: string) => FEATURED.has(slug);

async function readShard(shard: string): Promise<Record<string, RawCity>> {
  "use cache";
  cacheLife("max");
  if (!/^[a-z0-9-]{1,2}$/.test(shard)) return {};
  try {
    const file = path.join(process.cwd(), "data", "city", `${shard}.json`);
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return {};
  }
}

export async function getCity(slug: string): Promise<City | null> {
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) return null;
  const raw = (await readShard(slug.slice(0, 2)))[slug];
  if (!raw) return null;
  const [id, name, cc, region, lat, lon, tz, pop, near] = raw;
  return {
    slug,
    id,
    name,
    label: FEATURED.get(slug) ?? name,
    cc,
    country: countryName(cc),
    region,
    lat,
    lon,
    tz,
    pop,
    near: near.map(([s, km]) => ({ slug: s, km })),
    featured: FEATURED.has(slug),
  };
}

export async function getCities(slugs: string[]): Promise<City[]> {
  const list = await Promise.all(slugs.map(getCity));
  return list.filter((c): c is City => c !== null);
}

export const placeLine = (c: Pick<City, "region" | "country" | "name">) =>
  [c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ");
