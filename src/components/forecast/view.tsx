import { ViewTransition } from "react";
import { AdSlot } from "@/components/ad-slot";
import { ClimateSection } from "@/components/climate-section";
import { Destinations } from "@/components/destinations";
import { Nearby } from "@/components/nearby";
import { Reveal } from "@/components/reveal";
import { RootVars } from "@/components/root-vars";
import { ShareButton } from "@/components/share-button";
import { SiteFooter } from "@/components/site-footer";
import { SkyArt } from "@/components/sky-art";
import { Clk } from "@/components/units";
import { getClimate } from "@/lib/climate";
import type { City } from "@/lib/cities";
import { sceneOf, type Forecast } from "@/lib/forecast";
import { paletteVars } from "@/lib/scenes";
import { Curve } from "./curve";
import { DaysList } from "./days";
import { ForecastHeader } from "./header";
import { Hero } from "./hero";
import { HoursStrip } from "./hours";
import { CloudTile, FeelsTile, HumidityTile, MoonTile, PressureTile, RainTile, SunTile, UvTile, WindTile } from "./tiles";

export async function ForecastView({ city, f }: { city: City; f: Forecast }) {
  const sc = sceneOf(f);
  const vars = Object.entries(paletteVars(sc.palette))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  const climate = city.featured ? await getClimate(city.slug) : null;

  return (
    <ViewTransition update="none">
      <RootVars css={vars} />
      <SkyArt layers={sc.layers} />
      <ForecastHeader name={city.label} slug={city.slug} temp={f.now.temp} icon={f.hours[0]?.icon ?? "cloud"} />
      <main className="relative z-10" data-fetched-at={f.fetchedAt}>
        <section className="md:flex md:min-h-[max(100svh,640px)] md:flex-wrap md:items-end md:gap-8 md:px-10 md:pt-24 md:pb-10">
          <Hero f={f} slug={city.slug} name={city.label} />
          <div
            className="enter flex flex-col gap-[18px] rounded-t-[28px] bg-panel px-4 pt-2.5 pb-[18px] text-p-ink [--delay:120ms] [--rise:90px] md:flex-[0_1_720px] md:gap-5 md:rounded-[28px] md:px-6 md:py-7 md:[--delay:150ms] md:[--rise:48px]"
          >
            <div aria-hidden className="h-1 w-9 self-center rounded-sm bg-rule md:hidden" />
            <HoursStrip hours={f.hours} />
            <div className="h-px bg-rule" />
            <DaysList days={f.days} />
          </div>
        </section>

        <section aria-label="Details" className="bg-panel px-4 pb-8 text-p-ink md:px-10 md:py-10">
          <div className="mb-[18px] h-px bg-rule md:hidden" />
          <Reveal className="mx-auto grid max-w-[1600px] grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] md:gap-4">
            <div className="col-span-2 rounded-[20px] bg-tile px-4 pt-3.5 pb-3 md:col-span-full md:rounded-3xl md:px-6 md:pt-5 md:pb-4">
              <Curve temps={f.curve} />
            </div>
            <RainTile f={f} />
            <WindTile f={f} />
            <SunTile f={f} />
            <HumidityTile f={f} />
            <FeelsTile f={f} />
            <UvTile f={f} />
            <PressureTile f={f} />
            <CloudTile f={f} />
            <MoonTile f={f} />
          </Reveal>
          <div className="mx-auto mt-5 flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-p-muted">
              Updated <Clk t={f.fetchedLocal} /> local time. Forecast data from MET Norway, model output, not an official warning.
            </p>
            <ShareButton title={`${city.label} weather`} text={`${city.label}: ${f.now.temp}°C and ${f.condition.toLowerCase()} right now.`} />
          </div>
        </section>

        <AdSlot id="after-details" />
        {climate && <ClimateSection name={city.label} c={climate} />}
        <Nearby name={city.label} near={city.near} />
        <Destinations current={city.slug} />
        <SiteFooter />
      </main>
    </ViewTransition>
  );
}
