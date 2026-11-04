import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ForecastView } from "@/components/forecast/view";
import { PRERENDER, getCity } from "@/lib/cities";
import { getForecast } from "@/lib/met";
import { cityJsonLd, cityMetadata, sceneViewport } from "@/lib/seo";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/weather/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) return { title: "Place not found", robots: { index: false } };
  return cityMetadata(city, await getForecast(slug), { canonical: `/weather/${slug}` });
}

export async function generateViewport({ params }: PageProps<"/weather/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  return sceneViewport(await getForecast(slug));
}

export default async function CityPage({ params }: PageProps<"/weather/[slug]">) {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) notFound();
  const f = await getForecast(slug);
  if (!f) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(city, `/weather/${slug}`)) }} />
      <ForecastView city={city} f={f} />
    </>
  );
}
