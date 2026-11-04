import { getCity } from "@/lib/cities";
import { getForecast } from "@/lib/met";

const CACHE = "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600";

export async function GET(_req: Request, ctx: RouteContext<"/api/now/[slug]">) {
  const { slug } = await ctx.params;
  const city = await getCity(slug);
  if (!city) return Response.json({ error: "not found" }, { status: 404, headers: { "Cache-Control": "public, s-maxage=86400" } });
  const f = await getForecast(slug);
  if (!f) return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return Response.json(
    {
      slug,
      name: city.label,
      tz: city.tz,
      temp: f.now.temp,
      hi: f.range24.hi,
      lo: f.range24.lo,
      scene: f.sceneKey,
      sunHidden: f.sceneOpts.sunHidden,
      condition: f.condition,
      fetchedAt: f.fetchedAt,
    },
    { headers: { "Cache-Control": CACHE, "CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
