import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { PlacesApp } from "@/components/places/places-app";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Saved places and city search",
  description: "Search any city with 15,000+ people and keep a list of places with their current weather and local time.",
  alternates: { canonical: "/places" },
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: "#0b1020" };

export default function PlacesPage() {
  return (
    <ViewTransition>
      <style>{`:root{--sky:#0b1020;--ink:#f3efe6;--rule:rgba(243,239,230,0.12)}`}</style>
      <PlacesApp />
      <SiteFooter tone="night" />
    </ViewTransition>
  );
}
