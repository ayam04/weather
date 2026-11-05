import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { isSlug } from "./slug";

type ClimateMonth = { hi: number; lo: number; rain: number; wet: number };
export type Climate = {
  source: string;
  flags: string[];
  reviewed: boolean;
  period: string;
  tempStation: string;
  tempKm: number;
  rainStation: string;
  rainKm: number;
  months: ClimateMonth[];
};

export async function getClimate(slug: string): Promise<Climate | null> {
  "use cache";
  cacheLife("max");
  if (!isSlug(slug)) return null;
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", "climate", `${slug}.json`), "utf8"));
  } catch {
    return null;
  }
}

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function summarise(c: Climate) {
  const m = c.months;
  const idx = m.map((_, i) => i);
  const by = (f: (x: ClimateMonth) => number) => [...idx].sort((a, b) => f(m[b]) - f(m[a]));
  const warmest = by((x) => x.hi)[0];
  const coolest = by((x) => -x.hi)[0];
  const wettest = by((x) => x.rain)[0];
  const driest = by((x) => -x.rain)[0];
  const rainOk = rainTrusted(c);
  const wetMedian = [...m.map((x) => x.wet)].sort((a, b) => a - b)[6];
  const comfy = (i: number) => m[i].hi >= 18 && m[i].hi <= 30;
  let best: number[];
  let basis: "comfortDry" | "comfort" | "warmest" | "driest" | "none";
  if (m[warmest].hi < 18) {
    best = by((x) => x.hi).slice(0, 3);
    basis = "warmest";
  } else if (m[coolest].hi > 30 || idx.filter(comfy).length < 2) {
    if (rainOk) {
      best = by((x) => -x.wet).slice(0, 4);
      basis = "driest";
    } else {
      best = [];
      basis = "none";
    }
  } else if (rainOk) {
    best = idx.filter((i) => comfy(i) && m[i].wet <= wetMedian);
    basis = "comfortDry";
    if (best.length < 2) {
      best = idx.filter(comfy);
      basis = "comfort";
    }
  } else {
    best = idx.filter(comfy);
    basis = "comfort";
  }
  best = [...best].sort((a, b) => a - b);
  return { warmest, coolest, wettest, driest, best: ranges(best), bestMonths: best, basis };
}

function ranges(months: number[]): string {
  if (months.length === 0) return "";
  if (months.length === 12) return "all year";
  const set = new Set(months);
  const starts = months.filter((i) => !set.has((i + 11) % 12));
  const parts = starts.map((s) => {
    let e = s;
    while (set.has((e + 1) % 12) && (e + 1) % 12 !== s) e = (e + 1) % 12;
    return s === e ? MONTHS[s] : `${MONTHS[s]} to ${MONTHS[e]}`;
  });
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
}

export function rainTrusted(c: Pick<Climate, "flags">) {
  return c.flags.includes("rain-modelled") || !c.flags.some((f) => f.startsWith("rain-suspect"));
}

export async function getAllClimates(slugs: string[]) {
  const list = await Promise.all(slugs.map(async (slug) => [slug, await getClimate(slug)] as const));
  return list.filter((x): x is readonly [string, Climate] => x[1] !== null);
}
