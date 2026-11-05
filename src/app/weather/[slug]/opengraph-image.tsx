import { getCity, PRERENDER } from "@/lib/cities";
import { getClimate, summarise } from "@/lib/climate";
import { getForecast } from "@/lib/met";
import { brandOgImage, cityOgImage, OG_SIZE } from "@/lib/og";
import { isSlug } from "@/lib/slug";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Current weather and forecast";

export function generateStaticParams() {
  return PRERENDER.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = isSlug(slug) ? await getCity(slug) : null;
  const f = city ? await getForecast(slug).catch(() => null) : null;
  const climate = city?.featured ? await getClimate(slug) : null;
  return city && f ? cityOgImage(city, f, climate ? summarise(climate).best : undefined) : brandOgImage();
}
