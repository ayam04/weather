import type { CSSProperties } from "react";
import type { Layers } from "@/lib/scenes";
import { ART } from "./art/svg-data";

type Form = "phone" | "wide";

const VIEW: Record<Form, { box: string; ratio: string; rates: Record<string, number>; origin: string }> = {
  phone: {
    box: "0 0 390 560",
    ratio: "xMidYMin slice",
    rates: { dust: 0.05, stars: 0.12, cloud: 0.55 },
    origin: "74% 28%",
  },
  wide: {
    box: "0 0 1440 900",
    ratio: "xMaxYMin slice",
    rates: { dust: 0.04, stars: 0.1, cloud: 0.45 },
    origin: "75% 29%",
  },
};

function Layer({ form, html, rate, cls = "px", style }: { form: Form; html: string; rate?: number; cls?: string; style?: CSSProperties }) {
  const v = VIEW[form];
  return (
    <div className={`${cls} absolute inset-0`} style={{ ...(rate !== undefined ? ({ "--rate": rate } as CSSProperties) : null), ...style }}>
      <svg
        width="100%"
        height="100%"
        viewBox={v.box}
        preserveAspectRatio={v.ratio}
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function Form({ form, layers }: { form: Form; layers: Layers }) {
  const a = ART[form];
  const v = VIEW[form];
  const clouds = layers.clouds === "none" ? null : a[layers.clouds];
  return (
    <>
      {layers.stars > 0 && (
        <div style={{ opacity: layers.stars }}>
          <Layer form={form} html={a.stars[0]} rate={v.rates.dust} />
          <Layer form={form} html={a.stars[1]} rate={v.rates.stars} />
        </div>
      )}
      {layers.sun > 0 && (
        <Layer
          form={form}
          html={a.sun}
          cls="px-sun"
          style={
            {
              "--ring1": layers.sunRings[0],
              "--ring2": layers.sunRings[1],
              "--rays": layers.rays,
              transformOrigin: v.origin,
            } as CSSProperties
          }
        />
      )}
      {layers.moon > 0 && <Layer form={form} html={a.moon} cls="px-sun" style={{ transformOrigin: v.origin }} />}
      {clouds && <Layer form={form} html={clouds} rate={v.rates.cloud} />}
      {layers.bolt && <Layer form={form} html={a.bolt} rate={v.rates.cloud} />}
    </>
  );
}

export function SkyArt({ layers }: { layers: Layers }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[560px] md:hidden">
        <Form form="phone" layers={layers} />
      </div>
      <div className="absolute inset-0 hidden md:block">
        <Form form="wide" layers={layers} />
      </div>
      <div className="px-dim absolute inset-0 bg-panel opacity-0" />
    </div>
  );
}
