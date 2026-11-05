import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import featured from "@/data/featured.json";
import { isSlug } from "./slug";

type RawCity = [number, string, string, string, number, number, string, number, [string, number][]];

export type City = {
  slug: string;
  name: string;
  label: string;
  cc: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  tz: string;
  near: { slug: string; km: number }[];
  featured: boolean;
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (cc: string) => {
  try {
    return regionNames.of(cc) ?? cc;
  } catch {
    return cc;
  }
};

export const FEATURED_LABEL = new Map(featured.map((f) => [f.slug, f.label]));
export const FEATURED_SLUGS = featured.map((f) => f.slug);
export const PRERENDER = (process.env.PRERENDER_SLUGS ?? "london-gb").split(",").filter(Boolean);
export const cityTitle = (c: City) => (c.featured ? c.label : `${c.name}, ${c.country}`);

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
  if (!isSlug(slug)) return null;
  const raw = (await readShard(slug.slice(0, 2)))[slug];
  if (!raw) return null;
  const [, name, cc, region, lat, lon, tz, , near] = raw;
  return {
    slug,
    name,
    label: FEATURED_LABEL.get(slug) ?? name,
    cc,
    country: countryName(cc),
    region,
    lat,
    lon,
    tz,
    near: near.map(([s, km]) => ({ slug: s, km })),
    featured: FEATURED_LABEL.has(slug),
  };
}

export async function getCities(slugs: string[]): Promise<City[]> {
  const list = await Promise.all(slugs.map(getCity));
  return list.filter((c): c is City => c !== null);
}

export const placeLine = (c: Pick<City, "region" | "country" | "name">) =>
  [c.region && c.region !== c.name ? c.region : null, c.country].filter(Boolean).join(", ");
