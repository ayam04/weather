import { SITE } from "@/lib/site";

export function AdSlot({ id }: { id: string }) {
  if (!SITE.ads || !SITE.adsenseClient) return null;
  return (
    <aside aria-label="Advertisement" className="mx-auto my-6 w-full max-w-[970px] px-4 md:px-10" style={{ minHeight: 280 }}>
      <span className="mb-1 block text-[11px] tracking-wide text-p-muted">Advertisement</span>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 264 }}
        data-ad-client={SITE.adsenseClient}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
