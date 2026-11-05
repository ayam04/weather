import { cacheLife, cacheTag } from "next/cache";
import { getCity, type City } from "./cities";
import { mapForecast, type Forecast, type MetResponse } from "./forecast";

const USER_AGENT = process.env.MET_USER_AGENT || "weather-dev https://github.com/ayam04/weather";
const MAX_CONCURRENT = 4;
const ATTEMPT_MS = 8000;
const DEADLINE_MS = 15000;

let running = 0;
const queue: (() => void)[] = [];

async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (running < MAX_CONCURRENT) running++;
  else await new Promise<void>((r) => queue.push(r));
  try {
    return await fn();
  } finally {
    const next = queue.shift();
    if (next) next();
    else running--;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Product = "complete" | "compact";
type Attempt = { product: Product; digits: 4 | 3 | 2; wait: number };

const BAD_BODY = 598;
const NETWORK = 599;

async function once(lat: number, lon: number, a: Attempt, deadline: number): Promise<MetResponse | number> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/${a.product}?lat=${lat.toFixed(a.digits)}&lon=${lon.toFixed(a.digits)}`;
  let res: Response;
  try {
    res = await limited(() => {
      const signal = AbortSignal.timeout(Math.max(1, Math.min(ATTEMPT_MS, deadline - Date.now())));
      return fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Encoding": "gzip, deflate" }, cache: "no-store", signal });
    });
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

async function fetchMet(city: City): Promise<{ forecast: Forecast; partial: boolean }> {
  const deadline = Date.now() + DEADLINE_MS;
  let last = 0;
  for (const a of PLAN) {
    if (a.wait) await sleep(a.wait + Math.random() * 200);
    if (Date.now() >= deadline) break;
    const json = await once(city.lat, city.lon, a, deadline);
    const r = typeof json === "number" ? json : (mapForecast(json, city, new Date()) ?? BAD_BODY);
    if (typeof r !== "number") return { forecast: r, partial: a.product === "compact" };
    last = r;
    console.warn(`MET ${a.product} ${city.lat.toFixed(a.digits)},${city.lon.toFixed(a.digits)} failed: ${r === BAD_BODY ? "truncated, stale or invalid body" : r === NETWORK ? "network" : "HTTP " + r}`);
    if (r < 500) break;
  }
  throw new Error(`MET ${last}`);
}

export async function loadForecast(city: City): Promise<Forecast> {
  return (await fetchMet(city)).forecast;
}

export async function getForecast(slug: string): Promise<Forecast | null> {
  "use cache";
  cacheTag(`forecast:${slug}`);
  const city = await getCity(slug);
  if (!city) {
    cacheLife("hours");
    return null;
  }
  const { forecast, partial } = await fetchMet(city);
  if (partial) cacheLife({ stale: 60, revalidate: 300, expire: 604800 });
  else cacheLife({ stale: 300, revalidate: 1800, expire: 604800 });
  return forecast;
}
