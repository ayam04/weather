import { readdirSync } from "node:fs";

const SITE = process.env.SITE_URL ?? "https://weather.ayamk.in";
const keyFiles = readdirSync("public").filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (keyFiles.length !== 1) {
  console.error(`expected exactly one public/<32 hex chars>.txt IndexNow key file, found ${keyFiles.length}`);
  process.exit(1);
}
const key = keyFiles[0].slice(0, 32);

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
