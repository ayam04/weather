import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ForecastView } from "@/components/forecast/view";
import { RememberHome } from "@/components/remember-home";
import { PRERENDER, getCity } from "@/lib/cities";
import { getForecast } from "@/lib/met";
import { cityMetadata, jsonLd, sceneViewport } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { isSlug } from "@/lib/slug";

export const ensureStatic = "navigation";

const FALLBACK = "london-gb";

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

async function load(slug: string) {
  const city = await getCity(slug);
  const f = city && (await getForecast(slug));
  return city && f ? { city, f } : null;
}

async function resolve(slug: string) {
  return (isSlug(slug) && (await load(slug))) || (await load(FALLBACK));
}

export async function generateMetadata({ params }: PageProps<"/home/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const home = await resolve(slug);
  if (!home) return { robots: { index: false } };
  return cityMetadata(home.city, home.f, { canonical: "/", home: true });
}

export async function generateViewport({ params }: PageProps<"/home/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  return sceneViewport((await resolve(slug))?.f ?? null);
}

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

export default async function HomePage({ params }: PageProps<"/home/[slug]">) {
  const { slug } = await params;
  const home = await resolve(slug);
  if (!home) notFound();
  const { city, f } = home;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd) }} />
      <RememberHome slug={city.slug} name={city.label} />
      <ForecastView city={city} f={f} />
    </>
  );
}
