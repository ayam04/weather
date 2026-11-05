import { cacheLife, cacheTag } from "next/cache";
import { getCity, type City } from "./cities";
import { mapForecast, type Forecast, type MetResponse } from "./forecast";

const USER_AGENT = process.env.MET_USER_AGENT ?? "weather.ayamk.in https://weather.ayamk.in/contact";
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
type Attempt = { product: Product; digits: 4 | 3 | 2; wait: number };

const BAD_BODY = 598;
const NETWORK = 599;

async function once(lat: number, lon: number, a: Attempt): Promise<MetResponse | number> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/${a.product}?lat=${lat.toFixed(a.digits)}&lon=${lon.toFixed(a.digits)}`;
  let res: Response;
  try {
    res = await limited(() =>
      fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Encoding": "gzip, deflate" }, cache: "no-store", signal: AbortSignal.timeout(8000) }),
    );
  } catch {
    return NETWORK;
  }
  if (!res.ok) return res.status;
  try {
    const json = (await res.json()) as MetResponse;
    return json?.properties?.timeseries?.length ? json : BAD_BODY;
  } catch {
    return BAD_BODY;
  }
}

const PLAN: Attempt[] = [
  { product: "complete", digits: 4, wait: 0 },
  { product: "complete", digits: 3, wait: 300 },
  { product: "compact", digits: 4, wait: 0 },
  { product: "complete", digits: 2, wait: 600 },
  { product: "compact", digits: 3, wait: 600 },
  { product: "complete", digits: 4, wait: 1500 },
];

async function fetchMet(lat: number, lon: number): Promise<{ json: MetResponse; partial: boolean }> {
  let last = 0;
  for (const a of PLAN) {
    if (a.wait) await sleep(a.wait + Math.random() * 200);
    const r = await once(lat, lon, a);
    if (typeof r !== "number") return { json: r, partial: a.product === "compact" };
    last = r;
    console.warn(`MET ${a.product} ${lat.toFixed(a.digits)},${lon.toFixed(a.digits)} failed: ${r === BAD_BODY ? "truncated or invalid body" : r === NETWORK ? "network" : "HTTP " + r}`);
    if (r !== 429 && r < 500) break;
  }
  throw new Error(`MET ${last}`);
}

export async function loadForecast(city: City): Promise<Forecast> {
  const { json, partial } = await fetchMet(city.lat, city.lon);
  return { ...mapForecast(json, city, new Date()), partial };
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
