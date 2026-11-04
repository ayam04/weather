import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  if (!production) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/home/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
