import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { toF } from "@/components/units";
import { cityTitle, type City } from "./cities";
import { sceneOf, type Forecast } from "./forecast";
import { SITE } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

async function fontFiles() {
  "use cache";
  cacheLife("max");
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [medium, semibold] = await Promise.all([readFile(path.join(dir, "Bricolage-Medium.ttf")), readFile(path.join(dir, "Bricolage-SemiBold.ttf"))]);
  return [new Uint8Array(medium), new Uint8Array(semibold)];
}

async function fonts() {
  const [medium, semibold] = await fontFiles();
  const own = (u: Uint8Array) => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
  return [
    { name: "Bricolage", data: own(medium), weight: 500 as const, style: "normal" as const },
    { name: "Bricolage", data: own(semibold), weight: 600 as const, style: "normal" as const },
  ];
}

function Circle({ x, y, r, color, opacity = 1 }: { x: number; y: number; r: number; color: string; opacity?: number }) {
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: color, opacity }} />;
}

function Cloud({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 260 * s, height: 140 * s, display: "flex" }}>
      <Circle x={70 * s} y={80 * s} r={50 * s} color={color} />
      <Circle x={135 * s} y={58 * s} r={66 * s} color={color} />
      <Circle x={200 * s} y={88 * s} r={44 * s} color={color} />
      <div style={{ position: "absolute", left: 20 * s, top: 80 * s, width: 224 * s, height: 52 * s, borderRadius: 26 * s, background: color }} />
    </div>
  );
}

function Art({ f }: { f: Forecast }) {
  const { palette: p, layers: l } = sceneOf(f);
  const drops = l.clouds === "light" || l.clouds === "heavy";
  return (
    <div style={{ position: "absolute", right: 0, top: 0, width: 560, height: 630, display: "flex" }}>
      {l.stars > 0 &&
        [
          [80, 90, 2],
          [460, 60, 2.5],
          [380, 210, 1.6],
          [140, 300, 2],
          [520, 380, 1.8],
          [260, 40, 1.4],
          [60, 470, 1.8],
        ].map(([x, y, r], i) => <Circle key={i} x={x} y={y} r={r} color="#FFFFFF" opacity={0.7 * l.stars} />)}
      {l.sun > 0 && (
        <>
          <Circle x={360} y={220} r={190} color={p.sun} opacity={l.sunRings[0]} />
          <Circle x={360} y={220} r={140} color={p.sun} opacity={l.sunRings[1]} />
          <Circle x={360} y={220} r={92} color={p.sun} />
        </>
      )}
      {l.moon > 0 && (
        <>
          <Circle x={360} y={210} r={150} color="#F1E6C8" opacity={0.07} />
          <Circle x={360} y={210} r={84} color="#F1E6C8" />
          <Circle x={400} y={180} r={74} color={p.sky} />
        </>
      )}
      {l.clouds !== "none" && (
        <>
          <Cloud x={200} y={170} s={1.35} color={p.cloudBack} />
          <Cloud x={40} y={300} s={1.1} color={p.cloudFront} />
        </>
      )}
      {drops &&
        Array.from({ length: l.clouds === "heavy" ? 18 : 11 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90 + ((i * 37) % 420),
              top: 430 + ((i * 53) % 120),
              width: 3,
              height: 34,
              borderRadius: 2,
              background: p.drop,
              opacity: 0.65,
              transform: "rotate(12deg)",
            }}
          />
        ))}
      {l.clouds === "snow" &&
        Array.from({ length: 14 }, (_, i) => <Circle key={i} x={100 + ((i * 41) % 420)} y={440 + ((i * 59) % 130)} r={5} color={p.drop} opacity={0.85} />)}
    </div>
  );
}

export async function cityOgImage(city: City, f: Forecast, best?: string) {
  const { palette: p } = sceneOf(f);
  const where = cityTitle(city);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: p.sky, color: p.ink, fontFamily: "Bricolage" }}>
        <Art f={f} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 44, fontWeight: 600 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill={p.ink}>
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            {where}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", fontSize: 230, fontWeight: 500, lineHeight: 0.85, letterSpacing: -10 }}>
              {f.now.temp}°
              <div style={{ display: "flex", flexDirection: "column", marginTop: 22, marginLeft: 18, letterSpacing: -1 }}>
                <span style={{ fontSize: 64, opacity: 0.75 }}>C</span>
                <span style={{ fontSize: 40, marginTop: 10, opacity: 0.6 }}>{toF(f.now.temp)}°F</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 28, marginTop: 26, fontSize: 40, fontWeight: 600 }}>
              <span>{f.condition}</span>
              <span style={{ opacity: 0.75 }}>
                High {f.range24.hi}° · Low {f.range24.lo}°
              </span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 500, opacity: 0.8 }}>{best ? `Best time to visit: ${best} · ${SITE.name}` : `${SITE.name} · hourly and 9-day forecast`}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}

export async function brandOgImage() {
  const sky = "#101A33";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: sky, color: "#F3EFE6", fontFamily: "Bricolage" }}>
        <div style={{ position: "absolute", right: 0, top: 0, width: 560, height: 630, display: "flex" }}>
          {[
            [80, 90, 2],
            [460, 60, 2.5],
            [380, 230, 1.6],
            [140, 320, 2],
            [520, 400, 1.8],
            [260, 40, 1.4],
            [60, 500, 1.8],
            [330, 520, 1.6],
          ].map(([x, y, r], i) => (
            <Circle key={i} x={x} y={y} r={r} color="#FFFFFF" opacity={0.7} />
          ))}
          <Circle x={350} y={250} r={170} color="#F1E6C8" opacity={0.07} />
          <Circle x={350} y={250} r={96} color="#F1E6C8" />
          <Circle x={396} y={214} r={84} color={sky} />
          <Cloud x={60} y={360} s={1.2} color="#36425C" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, opacity: 0.85 }}>{SITE.name}</div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 600, lineHeight: 1.02, letterSpacing: -3 }}>The forecast, and the best time to go</div>
            <div style={{ display: "flex", marginTop: 26, fontSize: 34, fontWeight: 500, opacity: 0.75 }}>Hourly and 9-day weather, plus month-by-month climate for 25 destinations</div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, opacity: 0.6 }}>Forecast data from MET Norway</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
