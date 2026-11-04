import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ForecastView } from "@/components/forecast/view";
import { PRERENDER, getCity } from "@/lib/cities";
import { getForecast } from "@/lib/met";
import { cityMetadata, sceneViewport } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/home/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) return { robots: { index: false } };
  return cityMetadata(city, await getForecast(slug), { canonical: "/", home: true });
}

export async function generateViewport({ params }: PageProps<"/home/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  return sceneViewport(await getForecast(slug));
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
  const city = await getCity(slug);
  if (!city) notFound();
  const f = await getForecast(slug);
  if (!f) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <ForecastView city={city} f={f} />
    </>
  );
}
