export function GET() {
  const pub = process.env.ADSENSE_PUBLISHER_ID;
  if (!pub) return new Response("", { status: 404 });
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
