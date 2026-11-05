import { getSnap } from "@/lib/snapshot";
import { isSlug } from "@/lib/slug";

const CACHE = "public, max-age=300, s-maxage=1800, stale-while-revalidate=300";

export async function GET(_req: Request, ctx: RouteContext<"/api/now/[slug]">) {
  const { slug } = await ctx.params;
  if (!isSlug(slug)) return Response.json({ error: "not found" }, { status: 404 });
  try {
    const snap = await getSnap(slug);
    if (!snap) return Response.json({ error: "not found" }, { status: 404, headers: { "Cache-Control": "public, s-maxage=86400" } });
    return Response.json(snap, { headers: { "Cache-Control": CACHE, "CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=30" } });
  }
}
