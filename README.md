# weather.ayamk.in

Live local weather built from the owner's mockup (`Downloads/Weather app.html`): an animated sky per condition, hourly and 9-day forecast, nine detail tiles, a saved-places screen with city search, and month-by-month climate guides for 25 travel destinations.

Next.js 16 (App Router, Cache Components), React 19.3, Tailwind CSS 4, TypeScript. No database.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Node 24. No environment variables are required. Optional ones are listed below.

## How a request is served

| Route | What happens | Cost per visit |
| --- | --- | --- |
| `/` | `src/proxy.ts` picks a city (saved `home` cookie, else nearest city over 100k people to Vercel's IP location) and rewrites to `/home/<slug>` | 1 tiny proxy run, page from cache |
| `/weather/<slug>` | Static page from the CDN. Regenerated in the background at most every 30 minutes, only when visited | 0 functions on a cache hit |
| `/places` | Static shell. Saved places live in `localStorage`; each card reads a cached snapshot first | CDN hits only |
| `/api/now/<slug>` | Small JSON for Places cards, `s-maxage=1800` at the CDN | 1 function per city per 30 min |
| City search | Prefix shards in `public/data/<version>/s/`, immutable, fetched once and filtered on the device | 0 functions |
| Precise location | Geo-grid shards in `public/data/<version>/g/`, nearest city computed on the device | 0 functions |

Weather comes from MET Norway (`src/lib/met.ts`). Every call sends an identifying User-Agent, uses at most 4-decimal coordinates, runs through a 4-request concurrency cap, retries 503s with backoff, and falls back from `complete` to `compact`. The mapped result, not the raw 100 KB response, is cached for 30 minutes per city (`'use cache'` + `cacheLife`). So MET sees at most one request per city per 30 minutes regardless of traffic.

Pages use `ensureStatic = "navigation"`: the first visit to an uncached city waits for one complete render (about 1 second), then everyone gets the cached page. Nobody ever sees a skeleton that swaps to content.

There is no polling. A tab left open refreshes once when you return to it, and only if its data is older than 35 minutes.

## Motion

- Scene art is the mockup's SVG, converted at build time (`scripts/build-art.mjs`). Rain and snow are regenerated from the mockup's measured parameters as CSS-animated lines, about a third of the original markup.
- Entrance motion (hero rise, sheet slide-up, staggered hours, growing bars) is CSS keyframes, so it starts on first paint without waiting for JavaScript.
- Parallax uses CSS scroll timelines (off the main thread), with a one-listener fallback for browsers without them.
- Tile gauges animate once when scrolled into view (one shared IntersectionObserver).
- Page changes use React `<ViewTransition>`: scenes crossfade, and a Places card's name and temperature morph into the city page.
- °C/°F and 12/24-hour time are both in the HTML and chosen by a tiny script before first paint, so cached pages are correct for every visitor with no flash.
- `prefers-reduced-motion` turns all of it off.

## Data pipeline

All generated files are committed. Rebuild only when the source data changes.

```bash
node scripts/build-data.mjs <geonames-dir>     # cities15000.txt + admin1CodesASCII.txt + countryInfo.txt from download.geonames.org
node scripts/build-climate.mjs <ghcn-dir> [slug...]   # ghcnd-stations.txt + ghcnd-inventory.txt from ncei.noaa.gov
node scripts/build-art.mjs <unpacked-mockup-dir>
```

`build-data` writes the slug-sharded city records (`data/city/`), search and geo shards (`public/data/<hash>/`), the proxy's big-city list and `src/data/version.ts`. The hash in the path makes the shards cacheable forever.

## Deploying

- Repository: https://github.com/ayam04/weather (private), connected to the Vercel project `ayam-projects/weather`.
- A push to `main` builds and deploys to production at https://weather.ayamk.in.
- Any other branch or pull request gets its own preview URL. Preview deployments serve a `robots.txt` that blocks all crawling (`VERCEL_ENV` check in `src/app/robots.ts`), so they never compete with production in search.
- Node 24 (`engines` in package.json). The build prerenders only `PRERENDER_SLUGS`, so a weather-API outage cannot fail a deploy.

## Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://weather.ayamk.in` |
| `MET_USER_AGENT` | Override the User-Agent sent to MET Norway |
| `PRERENDER_SLUGS` | Comma-separated cities to prerender at build. Defaults to `london-gb` |
| `GOOGLE_SITE_VERIFICATION` | Search Console meta tag |
| `ADSENSE_PUBLISHER_ID` | Enables `/ads.txt` (`pub-...`) |
| `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT` | Turn on the reserved ad slot. Off by default |

See `DECISIONS.md`, `LICENSES.md` and `REVIEW.md`.
