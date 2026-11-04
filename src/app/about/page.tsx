import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "About",
  description: "What this weather site is, who runs it, and what it is for.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <ProsePage title="About this site" updated="4 November 2026">
      <p>
        This is an independent weather site. It shows the forecast for where you are, and for anywhere with more than 15,000 people, with an hourly and 9-day
        outlook, wind, UV, pressure, sunrise and the moon.
      </p>
      <p>
        For popular travel destinations we also publish month-by-month climate averages built from weather-station records, so you can see when a place is warm,
        dry or crowded with rain before you book.
      </p>
      <h2>Who runs it</h2>
      <p>
        The site is built and maintained by Ayamullah Khan, a software engineer based in Delhi, India. It is not affiliated with any national weather service, and
        nothing here is an official warning.
      </p>
      <h2>How it is paid for</h2>
      <p>
        The site may show advertising and, on some travel pages, links to booking partners. When that happens, ads are labelled and partner links are disclosed
        next to them. Advertisers do not influence the forecasts or the climate data.
      </p>
    </ProsePage>
  );
}
