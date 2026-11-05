import { FEATURED_LABEL, FEATURED_SLUGS } from "@/lib/cities";
import { getAllClimates, MONTHS, rainTrusted } from "@/lib/climate";
import { SITE } from "@/lib/site";

const cell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const climates = await getAllClimates(FEATURED_SLUGS);
  const header = ["destination", "page", "month", "avg_high_c", "avg_low_c", "rainfall_mm", "rainy_days", "temperature_source", "rainfall_source", "period"];
  const lines = [header.join(",")];
  for (const [slug, c] of climates) {
    const rain = rainTrusted(c);
    c.months.forEach((m, i) => {
      lines.push(
        [
          FEATURED_LABEL.get(slug) ?? slug,
          `${SITE.url}/weather/${slug}`,
          MONTHS[i],
          m.hi,
          m.lo,
          rain ? m.rain : null,
          rain ? m.wet : null,
          c.tempStation.startsWith("NASA") ? "NASA POWER" : `NOAA GHCN-Daily: ${c.tempStation}`,
          rain ? (c.rainStation.startsWith("NASA") ? "NASA POWER" : `NOAA GHCN-Daily: ${c.rainStation}`) : "withheld (failed quality check)",
          c.period,
        ]
          .map(cell)
          .join(","),
      );
    });
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${SITE.name.replace(/\W+/g, "-")}-climate-by-month.csv"`,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
