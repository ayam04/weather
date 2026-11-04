import type { Metadata, Viewport } from "next";
import { placeLine, type City } from "./cities";
import type { Forecast } from "./forecast";
import { PALETTES } from "./scenes";
import { SITE } from "./site";

export function cityMetadata(city: City, f: Forecast | null, opts: { canonical: string; home?: boolean }): Metadata {
  const where = city.featured ? city.label : `${city.name}, ${city.country}`;
  const title = opts.home ? "Weather today: hourly and 9-day forecast" : `${where} weather: today, hourly and 9-day forecast`;
  const now = f ? `Now ${f.now.temp}°C (${Math.round((f.now.temp * 9) / 5 + 32)}°F) and ${f.condition.toLowerCase()} in ${city.name}. ` : "";
  const tail = city.featured
    ? "Hourly forecast, 9-day outlook, sunrise, UV, wind, and month-by-month climate averages for planning a trip."
    : "Hourly forecast, 9-day outlook, sunrise, UV, wind and humidity.";
  const description = `${now}${tail}`;
  return {
    title: opts.home ? { absolute: `${title} | ${SITE.name}` } : title,
    description,
    alternates: { canonical: opts.canonical },
    robots: city.featured || opts.home ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: opts.home ? title : `${where} weather`, description, url: opts.canonical, type: "website" },
  };
}

export function sceneViewport(f: Forecast | null): Viewport {
  return { themeColor: f ? PALETTES[f.sceneKey].sky : "#0b1020" };
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
