import { appIcon } from "@/lib/app-icon";

const ICONS: Record<string, { size: number; maskable?: boolean }> = {
  "icon-192.png": { size: 192 },
  "icon-512.png": { size: 512 },
  "maskable-512.png": { size: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(_req: Request, ctx: RouteContext<"/icons/[name]">) {
  const { name } = await ctx.params;
  const spec = ICONS[name];
  if (!spec) return new Response("Not found", { status: 404 });
  const res = appIcon(spec.size, { maskable: spec.maskable });
  res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return res;
}
