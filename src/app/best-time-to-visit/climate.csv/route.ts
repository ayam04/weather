import featured from "@/data/featured.json";
import { getAllClimates, MONTHS, rainTrusted } from "@/lib/climate";

const LABEL = new Map(featured.map((f) => [f.slug, f.label]));
const cell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const climates = await getAllClimates(featured.map((f) => f.slug));
  const header = ["destination", "page", "month", "avg_high_c", "avg_low_c", "rainfall_mm", "rainy_days", "temperature_source", "rainfall_source", "period"];
  const lines = [header.join(",")];
  for (const [slug, c] of climates) {
    const rain = rainTrusted(c);
    c.months.forEach((m, i) => {
      lines.push(
        [
          LABEL.get(slug) ?? slug,
          `https://weather.ayamk.in/weather/${slug}`,
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
      "Content-Disposition": 'attachment; filename="weather-ayamk-in-climate-by-month.csv"',
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
