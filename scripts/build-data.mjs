import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/build-data.mjs <geonames-dir>");
  process.exit(1);
}

const norm = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (s) => norm(s).replace(/ /g, "-");

const admin1 = new Map();
for (const line of readFileSync(join(src, "admin1CodesASCII.txt"), "utf8").split("\n")) {
  const [code, name, ascii] = line.split("\t");
  if (code) admin1.set(code, ascii || name);
}

const raw = readFileSync(join(src, "cities15000.txt"), "utf8");
const cities = [];
for (const line of raw.split("\n")) {
  const c = line.split("\t");
  if (c.length < 18) continue;
  const [id, name, ascii, alt, lat, lon, , , cc, , a1, , , , pop, , , tz] = c;
  if (!tz || !ascii) continue;
  const asciiNorm = norm(ascii);
  const alts =
    Number(pop) < 500000
      ? []
      : [
          ...new Set(
            alt
              .split(",")
              .map((a) => a.trim())
              .filter((a) => /^[A-Z][A-Za-z .'-]{1,24}$/.test(a))
              .map(norm)
              .filter((a) => a && a !== asciiNorm),
          ),
        ];
  cities.push({
    id: Number(id),
    name,
    ascii,
    cc,
    region: admin1.get(`${cc}.${a1}`) ?? "",
    lat: Number(Number(lat).toFixed(4)),
    lon: Number(Number(lon).toFixed(4)),
    tz,
    pop: Number(pop),
    alts,
  });
}

cities.sort((a, b) => b.pop - a.pop);

const taken = new Set();
for (const c of cities) {
  const base = slugify(c.ascii) || String(c.id);
  const cc = c.cc.toLowerCase();
  const region = slugify(c.region);
  const candidates = [`${base}-${cc}`, region ? `${base}-${region}-${cc}` : null, `${base}-${c.id}`].filter(Boolean);
  c.slug = candidates.find((s) => !taken.has(s));
  taken.add(c.slug);
}

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
const dist = (a, b) => {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const grid = new Map();
const cellKey = (lat, lon) => `${Math.floor(lat)},${Math.floor(lon)}`;
for (const c of cities) {
  const k = cellKey(c.lat, c.lon);
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push(c);
}

for (const c of cities) {
  const found = [];
  for (let ring = 1; ring <= 3; ring++) {
    found.length = 0;
    const lat0 = Math.floor(c.lat);
    const lon0 = Math.floor(c.lon);
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        const lon = ((lon0 + dx + 540) % 360) - 180;
        for (const o of grid.get(`${lat0 + dy},${lon}`) ?? []) {
          if (o.id === c.id || o.pop < 50000) continue;
          const d = dist(c, o);
          if (d >= 20 && d <= 250) found.push([d, o]);
        }
      }
    }
  }
  c.near = found
    .sort((a, b) => b[1].pop - a[1].pop)
    .slice(0, 6)
    .sort((a, b) => a[0] - b[0])
    .map(([d, o]) => [o.slug, Math.round(d)]);
}

const hash = createHash("sha256").update(raw).update("v3").digest("hex").slice(0, 10);

rmSync("data/city", { recursive: true, force: true });
mkdirSync("data/city", { recursive: true });
const byShard = new Map();
for (const c of cities) {
  const shard = c.slug.slice(0, 2);
  if (!byShard.has(shard)) byShard.set(shard, {});
  byShard.get(shard)[c.slug] = [c.id, c.name, c.cc, c.region, c.lat, c.lon, c.tz, c.pop, c.near];
}
for (const [shard, map] of byShard) writeFileSync(join("data/city", `${shard}.json`), JSON.stringify(map));

rmSync("public/data", { recursive: true, force: true });
const pubRoot = join("public/data", hash);
mkdirSync(join(pubRoot, "s"), { recursive: true });
mkdirSync(join(pubRoot, "g"), { recursive: true });

const buckets = new Map();
for (const c of cities) {
  const keys = new Set([norm(c.ascii), ...norm(c.ascii).split(" ").filter((w) => w.length >= 2), ...c.alts]);
  const byPrefix = new Map();
  for (const k of keys) {
    if (k.length < 2) continue;
    const p = k.slice(0, 2);
    if (!byPrefix.has(p)) byPrefix.set(p, []);
    byPrefix.get(p).push(k);
  }
  for (const [p, ks] of byPrefix) {
    if (!buckets.has(p)) buckets.set(p, []);
    buckets.get(p).push([c.slug, c.name, c.region, c.cc, ks.join("|")]);
  }
}
const file = (p) => join(pubRoot, "s", `${p.replace(/ /g, "_")}.json`);
const SPLIT_AT = 40 * 1024;
const split = [];
let biggest = 0;
let files = 0;
for (const [p, list] of buckets) {
  const body = JSON.stringify(list);
  if (body.length <= SPLIT_AT) {
    biggest = Math.max(biggest, body.length);
    writeFileSync(file(p), body);
    files++;
    continue;
  }
  split.push(p);
  writeFileSync(file(p), JSON.stringify(list.slice(0, 80)));
  files++;
  const sub = new Map();
  for (const e of list) {
    const p3s = new Set(e[4].split("|").filter((k) => k.startsWith(p) && k.length >= 3).map((k) => k.slice(0, 3)));
    for (const p3 of p3s) {
      if (!sub.has(p3)) sub.set(p3, []);
      sub.get(p3).push(e);
    }
  }
  for (const [p3, l3] of sub) {
    const b = JSON.stringify(l3);
    biggest = Math.max(biggest, b.length);
    writeFileSync(file(p3), b);
    files++;
  }
}

const geo = new Map();
const G = 5;
for (const c of cities) {
  const latCells = new Set([Math.floor(c.lat / G), Math.floor((c.lat - 1) / G), Math.floor((c.lat + 1) / G)]);
  const lonCells = new Set([Math.floor(c.lon / G), Math.floor((c.lon - 1) / G), Math.floor((c.lon + 1) / G)]);
  for (const y of latCells)
    for (const x of lonCells) {
      const k = `${y}_${x}`;
      if (!geo.has(k)) geo.set(k, []);
      geo.get(k).push([c.slug, c.name, c.lat, c.lon]);
    }
}
for (const [k, list] of geo) writeFileSync(join(pubRoot, "g", `${k}.json`), JSON.stringify(list));

const big = cities.filter((c) => c.pop >= 100000).map((c) => [c.slug, c.lat, c.lon]);
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/big-cities.json", JSON.stringify(big));
writeFileSync(
  "src/data/version.ts",
  `export const DATA_VERSION = "${hash}";\nexport const SPLIT_PREFIXES = new Set(${JSON.stringify(split.sort())});\nexport const GEO_CELL_DEG = ${G};\n`,
);

console.log(
  JSON.stringify({
    cities: cities.length,
    cityShards: byShard.size,
    searchFiles: files,
    splitPrefixes: split.length,
    biggestSearchFileKB: Math.round(biggest / 1024),
    geoCells: geo.size,
    bigCities: big.length,
    version: hash,
  }),
);
