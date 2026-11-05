# Decisions

2026-11-04 Decision: domain is weather.ayamk.in.
Why: the brief said "weather.imk.in"; the owner's Vercel-managed domain is ayamk.in and other projects already use subdomains of it (fya.ayamk.in, dossier.ayamk.in). Change `NEXT_PUBLIC_SITE_URL` if this is wrong.

2026-11-04 Decision: MET Norway for forecasts, not Open-Meteo.
Why: the playbook forbids free Open-Meteo on a site with ads (non-commercial licence). MET Norway is global, free and CC BY 4.0, which allows commercial use with credit.

2026-11-04 Decision: climate averages from NOAA GHCN-Daily station records, NASA POWER only as fallback.
Why: POWER's reanalysis grid gave wrong numbers at coastal cities (Lisbon July high 22.5°C against about 28°C; Reykjavik January rain 164 mm against about 75 mm). Station data matches published normals. Rainfall is cross-checked against POWER and hidden when they disagree by more than 2x.

2026-11-04 Decision: 25 launch destinations, indexable; every other city page is `noindex, follow`.
Why: playbook C4 (scaled content abuse) and F3 (launch 25, grow in waves). Any city can still be viewed and searched; only the curated pages ask to be indexed and appear in the sitemap.

2026-11-04 Decision: no ads, analytics or consent banner switched on yet.
Why: playbook stages. Ads come after indexing (about weeks 6 to 10), require the Vercel Pro plan, an AdSense application the owner approves, and a certified consent tool for EU, UK and Swiss visitors. One reserved slot exists (after the detail tiles) and renders nothing until `NEXT_PUBLIC_ADS_ENABLED=true`.

2026-11-04 Decision: home page follows the visitor (IP location or saved city) through a proxy rewrite to a cached page.
Why: one tiny proxy run instead of a full server render per visit, and the page itself stays CDN-cached.

2026-11-04 Decision: city search and nearest-city lookup run on the device against static, content-hashed shards.
Why: zero server functions for search, one cached CDN file per two or three typed letters, works at any traffic level.

2026-11-04 Decision: hero high and low cover the next 24 hours, not the calendar day.
Why: the forecast starts now, so a late-evening "today" high would only cover the remaining hours and mislead. Labelled for screen readers.

2026-11-04 Decision: rain tile covers the next 12 hours, not the next hour.
Why: the mockup's minute-by-minute bars need nowcast data MET only offers for the Nordics. Hourly amounts for 12 hours are real data everywhere.

2026-11-05 Decision: crawlers get the same cached page as browsers (`htmlLimitedBots` set to a pattern no real crawler sends).
Why: Next's default bot list (Bingbot, DuckDuckBot, Yandex, Applebot, Google-InspectionTool, link-preview bots) bypassed the CDN with a fresh server render per visit, 60% heavier because partial prefetching embeds a second copy of the page. Every page's metadata and content are already in the cached HTML, so the blocking bot render added cost and size with nothing to gain.
