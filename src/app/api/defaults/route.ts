import { getDefaultSnaps } from "@/lib/snapshot";

export async function GET() {
  try {
    const snaps = await getDefaultSnaps();
    return Response.json(snaps, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch {
    return Response.json({}, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
