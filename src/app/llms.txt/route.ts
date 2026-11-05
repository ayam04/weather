import featured from "@/data/featured.json";
import { SITE } from "@/lib/site";

export function GET() {
  const body = `# ${SITE.name}

> Free live weather for any city with more than 15,000 people: current conditions, a 24-hour hourly forecast, a 9-day outlook, wind, UV, pressure, sunrise and moon phase. Destination pages add month-by-month climate averages from weather-station records and a best-time-to-visit summary.

Forecasts come from MET Norway (CC BY 4.0) and are refreshed at most every 30 minutes; each page shows when it was updated. Climate averages cover 2015 to 2024 from NOAA GHCN-Daily station records, with NASA POWER only where no station qualified. Forecasts are model output, not official warnings.

## Destination guides

${featured.map((f) => `- [${f.label} weather and best time to visit](${SITE.url}/weather/${f.slug})`).join("\n")}

## Other pages

- [Best time to visit all 25 destinations, month by month](${SITE.url}/best-time-to-visit), with a CSV download
- [Search any city](${SITE.url}/places)
- [Where the data comes from](${SITE.url}/data-sources)
- [How the pages are built](${SITE.url}/how-we-forecast)
- [About](${SITE.url}/about)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
