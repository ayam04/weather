import type { MetadataRoute } from "next";
import { FEATURED_SLUGS } from "@/lib/cities";
import { SITE } from "@/lib/site";

const LAST_EDIT = new Date("2026-11-04");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/about", "/data-sources", "/how-we-forecast", "/privacy", "/terms", "/contact"];
  return [
    { url: SITE.url, changeFrequency: "hourly", priority: 1 },
    ...FEATURED_SLUGS.map((slug) => ({ url: `${SITE.url}/weather/${slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, lastModified: LAST_EDIT, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
