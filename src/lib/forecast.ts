import SunCalc from "suncalc";
import type { City } from "./cities";
import { scene, type SceneKey } from "./scenes";

export type Icon = "sun" | "moon" | "sunCloud" | "moonCloud" | "cloud" | "fog" | "rain" | "storm" | "snow" | "sleet";
export type Clock = { h24: string; h12: string };

export type Hour = { iso: string; label: Clock | null; icon: Icon; temp: number; precip: number; condition: string };
export type Day = { key: string; label: string; long: string; icon: Icon; hi: number; lo: number; precip: number; condition: string };

export type Forecast = {
  fetchedAt: string;
  fetchedLocal: Clock;
  tz: string;
  condition: string;
  sceneKey: SceneKey;
  sceneOpts: { sunHidden: boolean; heavy: boolean; thunder: boolean };
  now: {
    temp: number;
    feels: number;
    humidity: number;
    dew: number;
    pressure: number;
    pressureTrend: "rising" | "falling" | "steady";
    pressureDelta: number;
    windMs: number;
    windFrom: number;
    windCompass: string;
    beaufort: string;
    clouds: { total: number; low: number; mid: number; high: number };
    fog: number;
  };
  range24: { hi: number; lo: number };
  hours: Hour[];
  days: Day[];
  rain12: { mm: number[]; total: number; kind: "none" | "light" | "amount"; from: Clock | null; trend: "heavy" | "easing" | null };
  curve: number[];
  sun: { mode: "normal" | "polarDay" | "polarNight"; next: Clock | null; nextKind: "rise" | "set"; progress: number; dayLength: string | null };
  moon: { phase: number; name: string; illumination: number };
  uv: { now: number; peak: number; peakAt: Clock | null; level: string } | null;
};

type Details = Record<string, number>;
type Period = { summary?: { symbol_code: string }; details?: Details };
type Entry = { time: string; data: { instant: { details: Details }; next_1_hours?: Period; next_6_hours?: Period; next_12_hours?: Period } };
export type MetResponse = { properties: { meta: { updated_at: string }; timeseries: Entry[] } };

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

function clockFmt(tz: string) {
  const f24 = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const f12 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
  const h12 = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: true });
  return {
    time: (d: Date): Clock => ({ h24: f24.format(d), h12: f12.format(d) }),
    hour: (d: Date): Clock => ({ h24: f24.format(d), h12: h12.format(d) }),
  };
}

const dayKeyFmt = (tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
const hourOfDay = (tz: string) => {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" });
  return (d: Date) => Number(f.format(d));
};

type Parsed = {
  base: string;
  thunder: boolean;
  snow: boolean;
  sleet: boolean;
  rain: boolean;
  heavy: boolean;
  light: boolean;
  showers: boolean;
  fog: boolean;
  kind: "clear" | "fair" | "partly" | "cloudy" | "fog" | "precip";
  variant: "day" | "night" | null;
};

function parseSymbol(code: string): Parsed {
  const m = code.match(/^(.*?)(?:_(day|night|polartwilight))?$/)!;
  const base = m[1].replace(/^lights/, "light");
  const v = m[2] === "polartwilight" ? "night" : ((m[2] as "day" | "night" | undefined) ?? null);
  const thunder = base.includes("thunder");
  const snow = base.includes("snow");
  const sleet = base.includes("sleet");
  const rain = base.includes("rain");
  const precip = thunder || snow || sleet || rain;
  const kind: Parsed["kind"] = precip
    ? "precip"
    : base === "clearsky"
      ? "clear"
      : base === "fair"
        ? "fair"
        : base === "partlycloudy"
          ? "partly"
          : base === "fog"
            ? "fog"
            : "cloudy";
  return {
    base,
    thunder,
    snow,
    sleet,
    rain,
    heavy: base.startsWith("heavy"),
    light: base.startsWith("light"),
    showers: base.includes("showers"),
    fog: base === "fog",
    kind,
    variant: v,
  };
}

function isNight(p: Parsed, d: Date, c: City) {
  if (p.variant) return p.variant === "night";
  return SunCalc.getPosition(d, c.lat, c.lon).altitude < -0.0145;
}

function iconFor(p: Parsed, night: boolean): Icon {
  if (p.thunder) return "storm";
  if (p.snow) return "snow";
  if (p.sleet) return "sleet";
  if (p.rain) return "rain";
  if (p.fog) return "fog";
  if (p.kind === "cloudy") return "cloud";
  if (p.kind === "partly") return night ? "moonCloud" : "sunCloud";
  return night ? "moon" : "sun";
}

function conditionFor(p: Parsed, night: boolean): string {
  if (p.kind === "clear") return night ? "Clear" : "Sunny";
  if (p.kind === "fair") return night ? "Mostly clear" : "Mostly sunny";
  if (p.kind === "partly") return "Partly cloudy";
  if (p.kind === "cloudy") return "Cloudy";
  if (p.kind === "fog") return "Fog";
  const type = p.snow ? "snow" : p.sleet ? "sleet" : "rain";
  const intensity = p.heavy ? "Heavy " : p.light ? "Light " : "";
  const text = `${intensity}${type}${p.showers ? " showers" : ""}${p.thunder ? " and thunder" : ""}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function severity(p: Parsed): number {
  if (p.thunder) return 9;
  if (p.kind === "precip") return (p.heavy ? 7 : p.light ? 5 : 6) + (p.snow ? 0.5 : 0);
  return { fog: 4, cloudy: 3, partly: 2, fair: 1, clear: 0 }[p.kind];
}

function sceneFor(p: Parsed, night: boolean) {
  let key: SceneKey;
  if (p.thunder) key = "storm";
  else if (p.snow || p.sleet) key = night ? "snowNight" : "snow";
  else if (p.rain) key = night ? "rainNight" : "rain";
  else if (p.kind === "clear" || p.kind === "fair") key = night ? "night" : "day";
  else key = night ? "cloudyNight" : "cloudy";
  return { key, opts: { sunHidden: p.kind === "cloudy" || p.kind === "fog", heavy: p.heavy, thunder: p.thunder } };
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const compass = (deg: number) => COMPASS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
const BEAUFORT: [number, string][] = [
  [0.5, "Calm"],
  [1.6, "Light air"],
  [3.4, "Light breeze"],
  [5.5, "Gentle breeze"],
  [8, "Moderate breeze"],
  [10.8, "Fresh breeze"],
  [13.9, "Strong breeze"],
  [17.2, "Near gale"],
  [20.8, "Gale"],
  [24.5, "Strong gale"],
  [28.5, "Storm"],
  [32.7, "Violent storm"],
];
const beaufort = (ms: number) => BEAUFORT.find(([lim]) => ms < lim)?.[1] ?? "Hurricane force";

const dewPoint = (t: number, rh: number) => {
  const g = Math.log(Math.max(rh, 1) / 100) + (17.62 * t) / (243.12 + t);
  return (243.12 * g) / (17.62 - g);
};

const uvLevel = (uv: number) => (uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme");

function moonName(phase: number) {
  if (phase < 0.03 || phase > 0.97) return "New moon";
  if (phase < 0.22) return "Waxing crescent";
  if (phase < 0.28) return "First quarter";
  if (phase < 0.47) return "Waxing gibbous";
  if (phase < 0.53) return "Full moon";
  if (phase < 0.72) return "Waning gibbous";
  if (phase < 0.78) return "Last quarter";
  return "Waning crescent";
}

function rainSummary(mm: number[], labels: (Clock | null)[]): Omit<Forecast["rain12"], "mm"> {
  const total = r1(mm.reduce((s, x) => s + x, 0));
  if (total < 0.1) return { total: 0, kind: "none", from: null, trend: null };
  const first = mm.findIndex((x) => x >= 0.1);
  const peak = Math.max(...mm);
  const a = mm.slice(0, 4).reduce((s, x) => s + x, 0);
  const b = mm.slice(8).reduce((s, x) => s + x, 0);
  const kind = total < 1 ? "light" : "amount";
  const trend = peak >= 4 || total >= 10 ? "heavy" : first <= 0 && b < a * 0.5 ? "easing" : null;
  return { total, kind, from: first > 0 ? labels[first] : null, trend };
}

export function mapForecast(json: MetResponse, city: City, fetchedAt = new Date()): Forecast | null {
  const ts = json.properties.timeseries;
  const tz = city.tz;
  const fmt = clockFmt(tz);
  const dayKey = dayKeyFmt(tz);
  const hod = hourOfDay(tz);
  const nowMs = fetchedAt.getTime();
  const startIdx = ts.findIndex((e) => new Date(e.time).getTime() + 3600_000 > nowMs);
  if (startIdx < 0) return null;
  const series = ts.slice(startIdx);
  const first = series[0];
  const firstSym = first.data.next_1_hours?.summary?.symbol_code ?? first.data.next_6_hours?.summary?.symbol_code ?? "cloudy";
  const firstParsed = parseSymbol(firstSym);
  const firstNight = isNight(firstParsed, new Date(first.time), city);
  const sc = sceneFor(firstParsed, firstNight);
  const d0 = first.data.instant.details;

  const hourly = series.filter((e) => e.data.next_1_hours).slice(0, 25);
  const hours: Hour[] = hourly.slice(0, 24).map((e, i) => {
    const d = new Date(e.time);
    const p = parseSymbol(e.data.next_1_hours!.summary!.symbol_code);
    const night = isNight(p, d, city);
    return {
      iso: e.time,
      label: i === 0 ? null : fmt.hour(d),
      icon: iconFor(p, night),
      temp: r0(e.data.instant.details.air_temperature),
      precip: r1(e.data.next_1_hours!.details?.precipitation_amount ?? 0),
      condition: conditionFor(p, night),
    };
  });

  const temps24 = hourly.slice(0, 25).map((e) => e.data.instant.details.air_temperature);
  const range24 = { hi: r0(Math.max(...temps24)), lo: r0(Math.min(...temps24)) };

  const mm12 = hourly.slice(0, 12).map((e) => r1(e.data.next_1_hours!.details?.precipitation_amount ?? 0));
  const rain12 = { mm: mm12, ...rainSummary(mm12, hours.slice(0, 12).map((h) => h.label)) };

  type Acc = { temps: number[]; precip: number; syms: { p: Parsed; mid: Date; mm: number; noon: boolean }[] };
  const days = new Map<string, Acc>();
  const acc = (k: string) => {
    if (!days.has(k)) days.set(k, { temps: [], precip: 0, syms: [] });
    return days.get(k)!;
  };
  for (const e of series) {
    const d = new Date(e.time);
    const k = dayKey.format(d);
    acc(k).temps.push(e.data.instant.details.air_temperature);
    const one = e.data.next_1_hours;
    const six = e.data.next_6_hours;
    if (one?.summary) {
      const mm = one.details?.precipitation_amount ?? 0;
      acc(k).precip += mm;
      const h = hod(d);
      acc(k).syms.push({ p: parseSymbol(one.summary.symbol_code), mid: d, mm, noon: h >= 11 && h <= 13 });
    } else if (six?.summary) {
      const mid = new Date(d.getTime() + 3 * 3600_000);
      const mk = dayKey.format(mid);
      const mm = six.details?.precipitation_amount ?? 0;
      acc(mk).precip += mm;
      const h = hod(mid);
      acc(mk).syms.push({ p: parseSymbol(six.summary.symbol_code), mid, mm, noon: h >= 9 && h <= 15 });
      if (six.details?.air_temperature_max !== undefined) acc(mk).temps.push(six.details.air_temperature_max);
      if (six.details?.air_temperature_min !== undefined) acc(mk).temps.push(six.details.air_temperature_min);
    }
  }
  const todayKey = dayKey.format(fetchedAt);
  const wd = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" });
  const wdLong = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long" });
  const dayList: Day[] = [];
  for (const [k, a] of days) {
    if (a.temps.length < 2 || a.syms.length === 0) continue;
    const anyNoon = a.syms.some((s) => s.noon);
    if (k !== todayKey && !anyNoon) continue;
    const wettest = [...a.syms].sort((x, y) => y.mm - x.mm || severity(y.p) - severity(x.p))[0];
    const noon = a.syms.find((s) => s.noon) ?? a.syms[Math.floor(a.syms.length / 2)];
    const thunder = a.syms.some((s) => s.p.thunder && s.mm >= 0.5);
    const pick = a.precip >= 1 ? (thunder ? a.syms.find((s) => s.p.thunder)! : wettest) : noon;
    const night = k === todayKey && !anyNoon ? isNight(pick.p, pick.mid, city) : false;
    const date = new Date(`${k}T12:00:00Z`);
    dayList.push({
      key: k,
      label: k === todayKey ? "Today" : wd.format(date),
      long: k === todayKey ? "Today" : wdLong.format(date),
      icon: iconFor(pick.p, night),
      hi: r0(Math.max(...a.temps)),
      lo: r0(Math.min(...a.temps)),
      precip: r1(a.precip),
      condition: conditionFor(pick.p, night),
    });
  }

  const times = SunCalc.getTimes(fetchedAt, city.lat, city.lon);
  const valid = (d: Date) => d instanceof Date && !Number.isNaN(d.getTime());
  let sun: Forecast["sun"];
  if (!valid(times.sunrise) || !valid(times.sunset)) {
    const up = SunCalc.getPosition(times.solarNoon, city.lat, city.lon).altitude > 0;
    sun = { mode: up ? "polarDay" : "polarNight", next: null, nextKind: up ? "set" : "rise", progress: up ? 0.5 : 0, dayLength: up ? "24 h" : "0 h" };
  } else {
    const rise = times.sunrise.getTime();
    const set = times.sunset.getTime();
    const len = Math.round((set - rise) / 60000);
    const dayLength = `${Math.floor(len / 60)} h ${len % 60} min`;
    if (nowMs < rise) {
      sun = { mode: "normal", next: fmt.time(times.sunrise), nextKind: "rise", progress: 0, dayLength };
    } else if (nowMs < set) {
      sun = { mode: "normal", next: fmt.time(times.sunset), nextKind: "set", progress: (nowMs - rise) / (set - rise), dayLength };
    } else {
      const t2 = SunCalc.getTimes(new Date(nowMs + 86400_000), city.lat, city.lon);
      sun = { mode: "normal", next: valid(t2.sunrise) ? fmt.time(t2.sunrise) : null, nextKind: "rise", progress: 1, dayLength };
    }
  }

  const mi = SunCalc.getMoonIllumination(fetchedAt);

  const uvSeries = hourly
    .slice(0, 24)
    .map((e) => ({ d: new Date(e.time), uv: e.data.instant.details.ultraviolet_index_clear_sky }))
    .filter((x) => x.uv !== undefined);
  const uvPeak = uvSeries.reduce((m, x) => (x.uv > m.uv ? x : m), { d: fetchedAt, uv: -1 });
  const uvNow = d0.ultraviolet_index_clear_sky ?? 0;

  const p0 = d0.air_pressure_at_sea_level;
  const p3 = (hourly[3] ?? first).data.instant.details.air_pressure_at_sea_level;
  const dp = r1(p3 - p0);

  return {
    fetchedAt: fetchedAt.toISOString(),
    fetchedLocal: fmt.time(fetchedAt),
    tz,
    condition: conditionFor(firstParsed, firstNight),
    sceneKey: sc.key,
    sceneOpts: sc.opts,
    now: {
      temp: r0(d0.air_temperature),
      feels: r0(d0.apparent_air_temperature ?? d0.air_temperature),
      humidity: r0(d0.relative_humidity),
      dew: r0(d0.dew_point_temperature ?? dewPoint(d0.air_temperature, d0.relative_humidity)),
      pressure: r0(p0),
      pressureTrend: dp > 0.8 ? "rising" : dp < -0.8 ? "falling" : "steady",
      pressureDelta: dp,
      windMs: r1(d0.wind_speed),
      windFrom: r0(d0.wind_from_direction),
      windCompass: compass(d0.wind_from_direction),
      beaufort: beaufort(d0.wind_speed),
      clouds: {
        total: r0(d0.cloud_area_fraction ?? 0),
        low: r0(d0.cloud_area_fraction_low ?? 0),
        mid: r0(d0.cloud_area_fraction_medium ?? 0),
        high: r0(d0.cloud_area_fraction_high ?? 0),
      },
      fog: r0(d0.fog_area_fraction ?? 0),
    },
    range24,
    hours,
    days: dayList.slice(0, 9),
    rain12,
    curve: temps24.map(r1),
    sun,
    moon: { phase: mi.phase, name: moonName(mi.phase), illumination: r0(mi.fraction * 100) },
    uv: uvSeries.length
      ? {
          now: r1(uvNow),
          peak: r1(Math.max(uvPeak.uv, 0)),
          peakAt: uvPeak.uv > 0 ? fmt.hour(uvPeak.d) : null,
          level: uvLevel(Math.max(uvPeak.uv, 0)),
        }
      : null,
  };
}

export const sceneOf = (f: Pick<Forecast, "sceneKey" | "sceneOpts">) => scene(f.sceneKey, f.sceneOpts);
