import { DEFAULT_PLACES } from "@/data/default-places";
import { getDefaultSnaps } from "@/lib/snapshot";

const FULL = { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=300", "CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=300" };
const PARTIAL = { "Cache-Control": "public, s-maxage=60" };
const unavailable = () => Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=30" } });

export async function GET() {
  try {
    const snaps = await getDefaultSnaps();
    const count = Object.keys(snaps).length;
    if (!count) return unavailable();
    return Response.json(snaps, { headers: count < DEFAULT_PLACES.length ? PARTIAL : FULL });
  } catch {
    return unavailable();
  }
}
