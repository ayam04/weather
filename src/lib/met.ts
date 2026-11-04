import { cacheLife, cacheTag } from "next/cache";
import { getCity } from "./cities";
import { mapForecast, type Forecast, type MetResponse } from "./forecast";

const USER_AGENT = process.env.MET_USER_AGENT ?? "weather.ayamk.in github.com/ayam04";
const MAX_CONCURRENT = 4;

let running = 0;
const queue: (() => void)[] = [];

async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) await new Promise<void>((r) => queue.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    queue.shift()?.();
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Product = "complete" | "compact";

async function once(lat: number, lon: number, product: Product): Promise<MetResponse | number> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/${product}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  try {
    const res = await limited(() =>
      fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Encoding": "gzip, deflate" }, cache: "no-store", signal: AbortSignal.timeout(8000) }),
    );
    if (res.ok) return (await res.json()) as MetResponse;
    return res.status;
  } catch {
    return 599;
  }
}

const PLAN: [Product, number][] = [
  ["complete", 0],
  ["complete", 450],
  ["compact", 0],
  ["complete", 900],
  ["compact", 900],
  ["complete", 1800],
];

async function fetchMet(lat: number, lon: number): Promise<{ json: MetResponse; partial: boolean }> {
  let last = 0;
  for (const [product, wait] of PLAN) {
    if (wait) await sleep(wait + Math.random() * 200);
    const r = await once(lat, lon, product);
    if (typeof r !== "number") return { json: r, partial: product === "compact" };
    last = r;
    if (r !== 429 && r < 500) break;
  }
  throw new Error(`MET ${last}`);
}

export async function getForecast(slug: string): Promise<Forecast | null> {
  "use cache";
  cacheTag(`forecast:${slug}`);
  const city = await getCity(slug);
  if (!city) {
    cacheLife("max");
    return null;
  }
  const { json, partial } = await fetchMet(city.lat, city.lon);
  if (partial) cacheLife({ stale: 60, revalidate: 300, expire: 604800 });
  else cacheLife({ stale: 300, revalidate: 1800, expire: 604800 });
  return { ...mapForecast(json, city, new Date()), partial };
}
