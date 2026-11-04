import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using this weather site, including the limits of forecast accuracy.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <ProsePage title="Terms of use" updated="4 November 2026">
      <p>By using this site you agree to these terms.</p>
      <h2>Forecasts are not warnings</h2>
      <p>
        Forecasts here are computer model output and can be wrong. They are not official warnings. Do not rely on this site for decisions about safety. For severe
        weather, follow your national weather service and local authorities.
      </p>
      <h2>No guarantee</h2>
      <p>
        The site is provided as it is, without any promise that it will be accurate, complete or always available. To the extent the law allows, we are not
        responsible for losses that come from using it.
      </p>
      <h2>Data credits</h2>
      <p>Forecast data is from MET Norway, place data from GeoNames, and climate records from NOAA and NASA. Their licences are listed on the data sources page.</p>
      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>
    </ProsePage>
  );
}
