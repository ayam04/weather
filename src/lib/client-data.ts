import { DATA_VERSION, GEO_CELL_DEG, SPLIT_PREFIXES } from "@/data/version";

export type Match = { slug: string; name: string; region: string; cc: string; hit: string };
type Entry = [slug: string, name: string, region: string, cc: string, keys: string];

const shards = new Map<string, Promise<Entry[]>>();

export const norm = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trimStart();

function shard(key: string) {
  const file = key.replace(/ /g, "_");
  if (!shards.has(file)) {
    shards.set(
      file,
      fetch(`/data/${DATA_VERSION}/s/${file}.json`)
        .then((r) => (r.ok ? (r.json() as Promise<Entry[]>) : []))
        .catch(() => {
          shards.delete(file);
          return [];
        }),
    );
  }
  return shards.get(file)!;
}

export function prefetchShard(q: string) {
  const n = norm(q);
  if (n.length >= 2) void shard(n.slice(0, 2));
}

export async function searchCities(q: string, limit = 8): Promise<Match[]> {
  const n = norm(q).replace(/\s+$/, "");
  if (n.length < 2) return [];
  const p2 = n.slice(0, 2);
  const key = SPLIT_PREFIXES.has(p2) && n.length >= 3 ? n.slice(0, 3) : p2;
  const list = await shard(key);
  const out: Match[] = [];
  for (const [slug, name, region, cc, keys] of list) {
    const ks = keys.split("|");
    const hit = ks.find((k) => k.startsWith(n));
    if (!hit) continue;
    out.push({ slug, name, region, cc, hit });
    if (out.length >= limit) break;
  }
  return out;
}

type GeoEntry = [slug: string, name: string, lat: number, lon: number];

export async function nearestCity(lat: number, lon: number): Promise<{ slug: string; name: string } | null> {
  const y = Math.floor(lat / GEO_CELL_DEG);
  const x = Math.floor(lon / GEO_CELL_DEG);
  try {
    const res = await fetch(`/data/${DATA_VERSION}/g/${y}_${x}.json`);
    if (!res.ok) return null;
    const list = (await res.json()) as GeoEntry[];
    const c = Math.cos((lat * Math.PI) / 180);
    let best: GeoEntry | null = null;
    let bestD = Infinity;
    for (const e of list) {
      const d = ((e[3] - lon) * c) ** 2 + (e[2] - lat) ** 2;
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best ? { slug: best[0], name: best[1] } : null;
  } catch {
    return null;
  }
}
