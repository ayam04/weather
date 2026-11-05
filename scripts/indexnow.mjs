import { readFileSync } from "node:fs";

const SITE = process.env.SITE_URL ?? "https://weather.ayamk.in";
const key = readFileSync("src/data/indexnow.ts", "utf8").match(/"([a-f0-9]{32})"/)[1];

const keyRes = await fetch(`${SITE}/${key}.txt`);
if (!keyRes.ok || (await keyRes.text()).trim() !== key) {
  console.error(`key file not live at ${SITE}/${key}.txt; deploy first`);
  process.exit(1);
}

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const extra = process.argv.slice(2);
const urls = extra.length ? extra : urlList;

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow ${res.status} ${res.statusText} for ${urls.length} URLs`);
if (res.status >= 400) console.log(await res.text());
