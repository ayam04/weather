import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const mockDir = process.argv[2];
if (!mockDir) {
  console.error("usage: node scripts/build-art.mjs <unpacked mockup screens dir>");
  process.exit(1);
}

const VARS = {
  "s.sky": "--sky",
  "s.cloudBack": "--cloud-back",
  "s.cloudFront": "--cloud-front",
  "s.sun": "--sun",
  "s.ring1": "--ring1",
  "s.ring2": "--ring2",
  "s.rays": "--rays",
};

function clean(svgInner) {
  let s = svgInner
    .replace(/sc-camel-view-box/g, "viewBox")
    .replace(/sc-camel-preserve-aspect-ratio/g, "preserveAspectRatio")
    .replace(/sc-camel-attribute-name/g, "attributeName")
    .replace(/sc-camel-repeat-count/g, "repeatCount")
    .replace(/sc-camel-key-times/g, "keyTimes")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><");
  s = s.replace(/(fill|stroke|opacity)="\{\{([^}]+)\}\}"/g, (_, attr, key) => {
    const v = VARS[key.trim()];
    if (!v) throw new Error(`unmapped ${key}`);
    return `style="${attr}:var(${v})"`;
  });
  s = s.replace(/<(\w+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g, (tag, name, attrs, selfClose) => {
    const styles = [...attrs.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1].replace(/;\s*$/, ""));
    if (styles.length < 2) return tag;
    const rest = attrs.replace(/\sstyle="[^"]*"/g, "");
    return `<${name}${rest} style="${styles.join(";")}"${selfClose ? "/" : ""}>`;
  });
  if (/\{\{/.test(s)) throw new Error(`leftover template in ${s.slice(0, 200)}`);
  return s;
}

function innerOf(svg) {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

function layersFrom(file) {
  const html = readFileSync(join(mockDir, file), "utf8");
  const out = {};
  const re = /<sc-if value="\{\{s\.(\w+)\}\}"[^>]*>([\s\S]*?)<\/sc-if>/g;
  let m;
  while ((m = re.exec(html))) {
    const svgs = [...m[2].matchAll(/<svg[\s\S]*?<\/svg>/g)].map((x) => x[0]);
    out[m[1]] = svgs.map((svg) => clean(innerOf(svg)));
  }
  return out;
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cloudsOf(dryInner) {
  const groups = [...dryInner.matchAll(/<g style="fill:var\(--cloud-(back|front)\)">([\s\S]*?)<\/g>/g)];
  return groups.map(([, which, body]) => {
    const anim = body.match(/<animateTransform[^>]*><\/animateTransform>/)?.[0] ?? "";
    const shapes = body.replace(anim, "");
    const rects = [...shapes.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((r) => ({
      x: +r[1],
      bottom: +r[2] + +r[4],
      w: +r[3],
    }));
    return { which, anim, shapes, rects };
  });
}

const SPECS = {
  phone: {
    light: { count: 44, len: [12, 23], sw: [1.1, 1.8], dur: [0.7, 1.1], ty: [300, 431] },
    heavy: { count: 73, len: [15, 28], sw: [1.4, 2.2], dur: [0.5, 0.7], ty: [300, 431] },
    snow: { count: 46, r: [1.2, 2.6], dur: [3.2, 6], ty: [320, 440] },
  },
  wide: {
    light: { count: 84, len: [21, 36], sw: [1.4, 2.3], dur: [0.7, 1.1], ty: [456, 707] },
    heavy: { count: 141, len: [25, 45], sw: [1.8, 2.8], dur: [0.5, 0.7], ty: [456, 707] },
    snow: { count: 88, r: [1.6, 3.4], dur: [3.6, 6.5], ty: [470, 720] },
  },
};

function precip(groups, spec, kind, seed) {
  const rnd = mulberry32(seed);
  const lerp = ([a, b]) => a + (b - a) * rnd();
  const rects = groups.flatMap((g, gi) => g.rects.map((r) => ({ ...r, gi })));
  const totalW = rects.reduce((s, r) => s + r.w, 0);
  const per = new Map(groups.map((_, i) => [i, []]));
  for (let i = 0; i < spec.count; i++) {
    let pick = rnd() * totalW;
    const r = rects.find((x) => (pick -= x.w) <= 0) ?? rects[rects.length - 1];
    const x = +(r.x + 8 + rnd() * (r.w - 16)).toFixed(1);
    const y = +(r.bottom - 6 - rnd() * 10).toFixed(1);
    const ty = Math.round(lerp(spec.ty));
    const dur = lerp(spec.dur).toFixed(2);
    const delay = (-rnd() * Number(dur)).toFixed(2);
    const o = (0.5 + rnd() * 0.3).toFixed(2);
    if (kind === "snow") {
      const rr = lerp(spec.r).toFixed(1);
      const tx = Math.round((rnd() - 0.5) * 60);
      per.get(r.gi).push(`<circle class="fl" cx="${x}" cy="${y}" r="${rr}" style="--d:${dur}s;--l:${delay}s;--o:${o};--tx:${tx}px;--ty:${ty}px"/>`);
    } else {
      const len = lerp(spec.len);
      const sw = lerp(spec.sw).toFixed(1);
      const x2 = +(x - len * 0.2).toFixed(1);
      const y2 = +(y + len).toFixed(1);
      const tx = Math.round(-ty * 0.2);
      per.get(r.gi).push(`<line class="dr" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke-width="${sw}" style="--d:${dur}s;--l:${delay}s;--o:${o};--tx:${tx}px;--ty:${ty}px"/>`);
    }
  }
  return groups
    .map((g, i) => {
      const drops = per.get(i).join("");
      const dropsG = drops ? `<g class="drops">${drops}</g>` : "";
      return `<g style="fill:var(--cloud-${g.which})">${g.anim}${dropsG}${g.shapes}</g>`;
    })
    .join("");
}

const out = {};
for (const [form, file] of [
  ["phone", "0_3e65fb3b/index.html"],
  ["wide", "10_3b47834f/index.html"],
]) {
  const L = layersFrom(file);
  const groups = cloudsOf(L.dryClouds[0]);
  out[form] = {
    stars: L.showStars,
    sun: L.showSun[0],
    moon: L.showMoon[0],
    bolt: L.showBolt[0],
    dry: L.dryClouds[0],
    light: precip(groups, SPECS[form].light, "rain", form === "phone" ? 11 : 21),
    heavy: precip(groups, SPECS[form].heavy, "rain", form === "phone" ? 12 : 22),
    snow: precip(groups, SPECS[form].snow, "snow", form === "phone" ? 13 : 23),
  };
}

mkdirSync("src/components/art", { recursive: true });
writeFileSync("src/components/art/svg-data.ts", `export const ART = ${JSON.stringify(out, null, 0)} as const;\n`);
for (const f of ["phone", "wide"]) {
  console.log(f, Object.fromEntries(Object.entries(out[f]).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x.length) : v.length])));
}
