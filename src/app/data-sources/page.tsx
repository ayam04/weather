import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Where our data comes from",
  description: "The sources, licences and update times behind every forecast and climate figure on this site.",
  alternates: { canonical: "/data-sources" },
};

export default function DataSources() {
  return (
    <ProsePage title="Where our data comes from" updated="4 November 2026">
      <h2>Forecasts</h2>
      <p>
        Forecasts come from the Norwegian Meteorological Institute (MET Norway) Locationforecast service, licensed under the{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">
          Creative Commons Attribution 4.0
        </a>{" "}
        licence and the Norwegian Licence for Open Government Data. We reformat the data: we convert units, group hours into days, and work out daily highs and
        lows, rain totals and the weather picture you see. MET Norway does not endorse this site.
      </p>
      <p>
        We fetch a fresh forecast for each place at most every 30 minutes and show the time it was updated on every page. Forecasts are model output and can be
        wrong. For warnings, follow your national weather service.
      </p>
      <h2>Places and time zones</h2>
      <p>
        City names, regions, coordinates and time zones come from{" "}
        <a href="https://www.geonames.org/" rel="noopener">
          GeoNames
        </a>{" "}
        (CC BY 4.0), using every place with more than 15,000 people.
      </p>
      <h2>Climate averages</h2>
      <p>
        Monthly averages on destination pages are calculated by us from daily weather-station observations in NOAA&apos;s Global Historical Climatology Network
        (GHCN-Daily), which is public-domain data from the US government, for the years 2015 to 2024. Each page names the station used. Where no nearby station had
        enough records, we use NASA&apos;s POWER modelled climate grid instead and say so on the page.
      </p>
      <p>
        We cross-check every station&apos;s rainfall against NASA&apos;s estimate. If the two disagree by more than a factor of two, we hide the rainfall figures
        rather than show numbers we cannot trust.
      </p>
      <h2>Sun and moon</h2>
      <p>Sunrise, sunset, day length and moon phase are calculated from standard astronomical formulas for each place&apos;s coordinates.</p>
    </ProsePage>
  );
}
