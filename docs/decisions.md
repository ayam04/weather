# Decisions

The reasons behind choices that are not obvious from the code. The code carries no comments, so this is where the "why" lives.

## Data

**MET Norway for forecasts, not Open-Meteo.** MET Norway is global, free and licensed under CC BY 4.0, which allows commercial use with credit. Open-Meteo's free tier is non-commercial, so it cannot back a site that may carry ads.

**Climate averages from NOAA GHCN-Daily station records, NASA POWER only as a fallback.** POWER's reanalysis grid gave wrong numbers at coastal cities (Lisbon July high 22.5°C against about 28°C; Reykjavik January rain 164 mm against about 75 mm). Station data matches published normals. Rainfall is cross-checked against POWER and hidden when the two disagree by more than 2x.

**25 indexable destinations; every other city page is `noindex, follow`.** Any of the 34,197 cities can be viewed and searched, but only curated pages with real climate content ask to be indexed and appear in the sitemap. Thousands of near-identical forecast pages would read as scaled thin content.

**Hero high and low cover the next 24 hours, not the calendar day.** The forecast starts now, so a late-evening "today" high would only cover the remaining hours and mislead.

**Rain tile covers the next 12 hours, not the next hour.** Minute-by-minute nowcasts exist only for the Nordics. Hourly amounts for 12 hours are real data everywhere.

## Serving and cost

**Home page follows the visitor through a proxy rewrite to a cached page.** `src/proxy.ts` picks a city from the saved `home` cookie or the visitor's IP location and rewrites to `/home/<slug>`. One small proxy run per visit instead of a full server render, and the page itself stays cached. An unknown or stale slug falls back to the default city instead of a 404.

**City search and nearest-city lookup run on the device against static, content-hashed shards.** No server functions for search, one cached file per two or three typed letters, and it works at any traffic level. Never edit `public/data` by hand: rerun `npm run data:cities`, which changes the hash directory so the immutable cache headers stay correct.

**MET calls are capped and bounded.** At most 4 concurrent requests, an overall deadline of about 15 seconds per forecast, no retries after a 429, and fallbacks (compact product, lower coordinate precision) only for 5xx, network errors and truncated bodies. The mapped forecast is cached per city, so MET sees at most one request per city per 30 minutes.

**Crawlers get the same cached page as browsers.** `htmlLimitedBots` is set to a pattern no real crawler sends. Next's default bot list (Bingbot, DuckDuckBot, Yandex, Applebot, Google-InspectionTool, link-preview bots) otherwise bypassed the CDN with a fresh server render per visit, 60% heavier because partial prefetching embeds a second copy of the page. Every page's metadata and content are already in the cached HTML.

## Front end

**Page colours go through `RootVars`, which switches its `:root` stylesheet off while its page is hidden.** Next keeps visited pages in the DOM, hidden, for instant back navigation, and a hidden `<style>` still applies. Without this, a day page visited earlier painted its colours over a night page. Effect cleanup alone missed hides after back and forward navigation, and `sheet.disabled` was reset when React reordered the hidden pages, so the component watches its own element's `display` and toggles the `media` attribute, which survives DOM moves.

**Units are chosen before first paint.** Both °C and °F (and 12 and 24-hour times) are in the HTML, and a tiny inline script picks one before paint, so a single cached page is right for every visitor.

## Production

**Security headers on every route.** `nosniff`, a strict referrer policy, a permissions policy that only allows geolocation for this origin, `X-Frame-Options: DENY`, and in production a static Content-Security-Policy. The CSP allows `'unsafe-inline'` for scripts and styles because Next's cached and partially prerendered pages cannot use per-request nonces. If ads are switched on, add the ad network's script, frame and connect origins to the CSP first.

**Deployment-specific values come from environment variables.** `MET_USER_AGENT` and `NEXT_PUBLIC_CONTACT_EMAIL` are set in Vercel. The code's fallbacks identify a development build, so a fork never sends this site's identity to MET Norway.

**No ads yet.** One reserved slot exists after the detail tiles and renders nothing until `NEXT_PUBLIC_ADS_ENABLED=true`. Ads need a paid Vercel plan, an approved ad account and a certified consent tool for EU, UK and Swiss visitors.
