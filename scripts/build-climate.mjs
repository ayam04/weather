import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ghcnDir = process.argv[2];
if (!ghcnDir) {
  console.error("usage: node scripts/build-climate.mjs <dir with ghcnd-stations.txt and ghcnd-inventory.txt> [slug...]");
  process.exit(1);
}
const only = new Set(process.argv.slice(3));

const Y0 = 2015;
const Y1 = 2024;
const featured = JSON.parse(readFileSync("src/data/featured.json", "utf8")).filter((f) => !only.size || only.has(f.slug));
mkdirSync("data/climate", { recursive: true });

const lookup = (slug) => JSON.parse(readFileSync(join("data/city", `${slug.slice(0, 2)}.json`), "utf8"))[slug];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const km = (a, b) => {
  const h =
    Math.sin(rad(b[0] - a[0]) / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(rad(b[1] - a[1]) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const stations = new Map();
for (const line of readFileSync(join(ghcnDir, "ghcnd-stations.txt"), "utf8").split("\n")) {
  if (line.length < 40) continue;
  stations.set(line.slice(0, 11), {
    id: line.slice(0, 11),
    lat: Number(line.slice(12, 20)),
    lon: Number(line.slice(21, 30)),
    name: line.slice(41, 71).trim(),
    vars: {},
  });
}
for (const line of readFileSync(join(ghcnDir, "ghcnd-inventory.txt"), "utf8").split("\n")) {
  const id = line.slice(0, 11);
  const v = line.slice(31, 35);
  if (v !== "TMAX" && v !== "TMIN" && v !== "PRCP") continue;
  const s = stations.get(id);
  if (s) s.vars[v] = [Number(line.slice(36, 40)), Number(line.slice(41, 45))];
}

async function fetchStation(id) {
  const url = `https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=${id}&startDate=${Y0}-01-01&endDate=${Y1}-12-31&dataTypes=TMAX,TMIN,PRCP&format=json&units=metric`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "weather.ayamk.in climate build" } });
      if (res.ok) return await res.json();
    } catch {}
    await sleep(2500 * attempt);
  }
  throw new Error(`NCEI failed for ${id}`);
}

const DIM = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MIN_DAYS = 60;

function summarise(rows) {
  const months = Array.from({ length: 12 }, () => ({ hi: [], lo: [], pr: [] }));
  for (const r of rows) {
    const b = months[Number(r.DATE.slice(5, 7)) - 1];
    if (r.TMAX !== undefined && r.TMAX !== "") b.hi.push(Number(r.TMAX));
    if (r.TMIN !== undefined && r.TMIN !== "") b.lo.push(Number(r.TMIN));
    if (r.PRCP !== undefined && r.PRCP !== "") b.pr.push(Number(r.PRCP));
  }
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const temps = months.every((b) => b.hi.length >= MIN_DAYS && b.lo.length >= MIN_DAYS)
    ? months.map((b) => ({ hi: r1(avg(b.hi)), lo: r1(avg(b.lo)), n: Math.min(b.hi.length, b.lo.length) }))
    : null;
  const precip = months.every((b) => b.pr.length >= MIN_DAYS)
    ? months.map((b, i) => ({
        rain: Math.round(avg(b.pr) * DIM[i]),
        wet: r1((b.pr.filter((x) => x >= 1).length / b.pr.length) * DIM[i]),
        n: b.pr.length,
      }))
    : null;
  return { temps, precip };
}

async function powerFallback(lat, lon) {
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=RE&latitude=${lat}&longitude=${lon}&start=${Y0}0101&end=${Y1}1231&format=JSON`;
  let j;
  for (let attempt = 1; attempt <= 5 && !j; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) j = await res.json();
    } catch {}
    if (!j) await sleep(3000 * attempt);
  }
  if (!j) throw new Error("POWER failed");
  const p = j.properties.parameter;
  const rows = Object.keys(p.T2M_MAX).map((d) => ({
    DATE: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
    TMAX: p.T2M_MAX[d],
    TMIN: p.T2M_MIN[d],
    PRCP: p.PRECTOTCORR[d],
  }));
  return summarise(rows);
}

const AIRPORT = /(AP|AIRP|AIRPORT|INTL|INTER|INTERNATIONAL)/;

for (const { slug } of featured) {
  const rec = lookup(slug);
  if (!rec) throw new Error(`unknown slug ${slug}`);
  const here = [rec[4], rec[5]];
  const near = [...stations.values()]
    .filter((s) => s.vars.TMAX || s.vars.PRCP)
    .filter((s) => ["TMAX", "TMIN", "PRCP"].some((v) => s.vars[v] && s.vars[v][1] >= Y1 && s.vars[v][0] <= Y0 + 2))
    .map((s) => {
      const d = km(here, [s.lat, s.lon]);
      return { s, d, rank: AIRPORT.test(s.name) ? d * 0.6 : d };
    })
    .filter((x) => x.d <= 50)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 6);
  let temps = null;
  let precip = null;
  for (const { s, d } of near) {
    if (temps && precip) break;
    const sum = summarise(await fetchStation(s.id));
    const usedT = !temps && sum.temps;
    const usedP = !precip && sum.precip;
    if (usedT) temps = { station: s.name, km: Math.round(d), data: sum.temps };
    if (usedP) precip = { station: s.name, km: Math.round(d), data: sum.precip };
    console.log(`  ${slug} ${s.id} ${s.name} ${d.toFixed(1)}km temps:${sum.temps ? "ok" : "-"} precip:${sum.precip ? "ok" : "-"}${usedT ? " [T]" : ""}${usedP ? " [P]" : ""}`);
    await sleep(700);
  }
  const pw = await powerFallback(rec[4], rec[5]);
  const flags = [];
  if (precip && pw.precip) {
    const st = precip.data.reduce((a, m) => a + m.rain, 0);
    const model = pw.precip.reduce((a, m) => a + m.rain, 0);
    const ratio = st / model;
    if (ratio < 0.5 || ratio > 2) {
      flags.push(`rain-suspect: station ${st} mm/yr vs model ${model} mm/yr`);
      precip = null;
    }
  }
  if (!temps && pw.temps) temps = { station: "NASA POWER model grid", km: 0, data: pw.temps };
  if (!precip && pw.precip) precip = { station: "NASA POWER model grid", km: 0, data: pw.precip };
  if (temps.station.startsWith("NASA")) flags.push("temps-modelled");
  if (precip.station.startsWith("NASA")) flags.push("rain-modelled");
  const source = temps.station.startsWith("NASA") && precip.station.startsWith("NASA") ? "NASA POWER" : precip.station.startsWith("NASA") || temps.station.startsWith("NASA") ? "NOAA GHCN-Daily and NASA POWER" : "NOAA GHCN-Daily";
  const months = temps.data.map((t, i) => ({ hi: t.hi, lo: t.lo, rain: precip.data[i].rain, wet: precip.data[i].wet }));
  writeFileSync(
    join("data/climate", `${slug}.json`),
    JSON.stringify({ source, flags, reviewed: false, period: `${Y0}-${Y1}`, tempStation: temps.station, tempKm: temps.km, rainStation: precip.station, rainKm: precip.km, months }),
  );
  console.log(slug, flags.join(";") || "clean", `T:${temps.station} P:${precip.station}`, months.map((m) => `${m.hi}/${m.lo}/${m.rain}/${m.wet}`).join(" "));
}
