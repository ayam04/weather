import { NextResponse, type NextRequest } from "next/server";
import big from "@/data/big-cities.json";

const DEFAULT = "london-gb";
const CITIES = big as [string, number, number][];
const rad = Math.PI / 180;

function nearest(lat: number, lon: number) {
  let best = DEFAULT;
  let bestD = Infinity;
  const cosLat = Math.cos(lat * rad);
  for (const [slug, la, lo] of CITIES) {
    let dLon = Math.abs(lo - lon);
    if (dLon > 180) dLon = 360 - dLon;
    const dx = dLon * cosLat;
    const dy = la - lat;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = slug;
    }
  }
  return best;
}

export function proxy(req: NextRequest) {
  const saved = req.cookies.get("home")?.value;
  let slug = saved && /^[a-z0-9-]{2,80}$/.test(saved) ? saved : null;
  if (!slug) {
    const lat = Number.parseFloat(req.headers.get("x-vercel-ip-latitude") ?? "");
    const lon = Number.parseFloat(req.headers.get("x-vercel-ip-longitude") ?? "");
    slug = Number.isFinite(lat) && Number.isFinite(lon) ? nearest(lat, lon) : DEFAULT;
  }
  const res = NextResponse.rewrite(new URL(`/home/${slug}`, req.url));
  res.headers.set("Vary", "Cookie, X-Vercel-IP-Latitude, X-Vercel-IP-Longitude");
  return res;
}

export const config = { matcher: "/" };
