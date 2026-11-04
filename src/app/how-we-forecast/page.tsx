import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "How our pages work",
  description: "How we turn raw forecast data into the hourly, daily and climate figures on this site, and how we check them.",
  alternates: { canonical: "/how-we-forecast" },
};

export default function HowWeForecast() {
  return (
    <ProsePage title="How our pages work" updated="4 November 2026">
      <h2>From forecast data to the page</h2>
      <ul>
        <li>The temperature, wind, humidity, pressure, cloud and UV figures are taken directly from the forecast for the current hour.</li>
        <li>Daily highs and lows combine the hourly temperatures with the forecast&apos;s six-hour minimum and maximum, in the place&apos;s own time zone.</li>
        <li>Daily rain totals add up hourly amounts where they exist and six-hour amounts after that, without counting any hour twice.</li>
        <li>The weather picture follows the current conditions, including whether it is day or night where the place is.</li>
        <li>UV is the clear-sky value. Clouds lower the real number.</li>
      </ul>
      <h2>Climate and best-time-to-visit guides</h2>
      <p>
        The best months shown on destination pages come from a fixed rule applied to the averages: months with average highs between 18°C and 30°C and fewer rainy
        days than the yearly middle. Where no month fits, we say which rule we used instead. Each page names the weather station its figures come from, so you can check them against the original records.
      </p>
      <h2>Corrections</h2>
      <p>
        If something looks wrong, tell us through the contact page with the place and what you saw. We fix confirmed errors across every page that uses the same
        data.
      </p>
    </ProsePage>
  );
}
