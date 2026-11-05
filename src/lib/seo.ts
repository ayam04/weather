import type { Metadata, Viewport } from "next";
import { toF } from "@/components/units";
import { cityTitle, placeLine, type City } from "./cities";
import type { Forecast } from "./forecast";
import { PALETTES } from "./scenes";
import { NIGHT_SKY, SITE } from "./site";

export function cityMetadata(city: City, f: Forecast | null, opts: { canonical: string; home?: boolean }): Metadata {
  const where = cityTitle(city);
  const title = opts.home
    ? "Weather today: hourly and 9-day forecast"
    : fitTitle(`${where} weather: hourly and 9-day forecast`, `${where} weather: 9-day forecast`, `${where} weather forecast`, `${where} weather`, `${city.name} weather`);
  const now = f ? `Now ${f.now.temp}°C (${toF(f.now.temp)}°F) and ${f.condition.toLowerCase()} in ${city.name}. ` : "";
  const tail = city.featured
    ? "Hourly forecast, 9-day outlook, sunrise, UV, wind, and month-by-month climate averages for planning a trip."
    : "Hourly forecast, 9-day outlook, sunrise, UV, wind and humidity.";
  const description = `${now}${tail}`;
  return {
    title: { absolute: opts.home ? `${title} | ${SITE.name}` : title },
    description,
    alternates: { canonical: opts.canonical },
    robots: city.featured || opts.home ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: opts.home ? title : `${where} weather`, description, url: opts.canonical, type: "website" },
  };
}

const TITLE_MAX = 65;

export function fitTitle(...options: string[]) {
  const all = [...options.map((t) => `${t} | ${SITE.name}`), ...options];
  return all.find((t) => t.length <= TITLE_MAX) ?? options[options.length - 1].slice(0, TITLE_MAX);
}

export const jsonLd = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

export function sceneViewport(f: Forecast | null): Viewport {
  return { themeColor: f ? PALETTES[f.sceneKey].sky : NIGHT_SKY };
}

export function cityJsonLd(city: City, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE.url}${canonical}#page`,
        url: `${SITE.url}${canonical}`,
        name: `${city.label} weather forecast`,
        isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
        about: {
          "@type": "Place",
          name: city.name,
          address: { "@type": "PostalAddress", addressRegion: city.region || undefined, addressCountry: city.cc },
          geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lon },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Weather", item: SITE.url },
          { "@type": "ListItem", position: 2, name: `${city.label}, ${placeLine(city)}`, item: `${SITE.url}${canonical}` },
        ],
      },
    ],
  };
}
