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

const BACKOFF = [0, 600, 1200, 2000, 3000];

async function fetchMet(lat: number, lon: number, product: "complete" | "compact"): Promise<MetResponse> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/${product}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  let last = 0;
  for (let attempt = 0; attempt < BACKOFF.length; attempt++) {
    if (attempt > 0) await sleep(BACKOFF[attempt] + Math.random() * 300);
    const res = await limited(() =>
      fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Encoding": "gzip, deflate" }, cache: "no-store" }),
    );
    if (res.ok) return (await res.json()) as MetResponse;
    last = res.status;
    if (res.status !== 429 && res.status < 500) break;
  }
  throw new Error(`MET ${last}`);
}

export async function getForecast(slug: string): Promise<Forecast | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  cacheTag(`forecast:${slug}`);
  const city = await getCity(slug);
  if (!city) return null;
  const json = await fetchMet(city.lat, city.lon, "complete").catch(() => fetchMet(city.lat, city.lon, "compact"));
  return mapForecast(json, city, new Date());
}
