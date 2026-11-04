import type { CSSProperties, ReactNode } from "react";
import { Clk, Precip, Pressure, Speed, T } from "@/components/units";
import type { Forecast } from "@/lib/forecast";

function Tile({ label, note, children, value }: { label: string; note?: ReactNode; children: ReactNode; value: ReactNode }) {
  return (
    <div className="flex h-[172px] flex-col justify-between rounded-[20px] bg-tile px-4 py-3.5 md:h-[212px] md:rounded-3xl md:px-5 md:py-[18px]">
      <span className="truncate text-[13px] text-p-muted md:text-sm">{label}</span>
      {children}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-lg font-semibold md:text-xl">{value}</span>
        <span className="truncate text-xs text-p-muted md:text-[13px]">{note ?? " "}</span>
      </div>
    </div>
  );
}

export function RainTile({ f }: { f: Forecast }) {
  const r = f.rain12;
  const peak = Math.max(4, ...r.mm);
  const value =
    r.kind === "none" ? (
      "None expected"
    ) : (
      <>
        {r.kind === "light" ? "Light" : <Precip mm={r.total} />}
        {r.from ? (
          <>
            {" "}
            from <Clk t={r.from} />
          </>
        ) : r.trend === "heavy" ? (
          ", heavy"
        ) : r.trend === "easing" ? (
          ", easing"
        ) : (
          ""
        )}
      </>
    );
  const note = r.kind === "none" ? "Dry for the next 12 hours" : r.kind === "light" ? <><Precip mm={r.total} /> in total</> : r.trend === "heavy" ? "Heavy bursts possible" : "Over the next 12 hours";
  return (
    <Tile label="Rain · next 12 h" value={value} note={note}>
      <div role="img" aria-label={r.kind === "none" ? "No rain expected in the next 12 hours" : `${r.total} millimetres of rain expected in the next 12 hours`} className="flex h-14 items-end gap-1 md:h-20 md:gap-[5px]">
        {r.mm.map((mm, i) => (
          <span
            key={i}
            className="r-y flex-1 rounded-[3px] bg-rain-bar"
            style={{ height: `${Math.max((mm / peak) * 100, 6)}%`, opacity: mm < 0.1 ? 0.3 : 1, "--i": i } as CSSProperties}
          />
        ))}
      </div>
    </Tile>
  );
}

export function WindTile({ f }: { f: Forecast }) {
  const to = (f.now.windFrom + 180) % 360;
  return (
    <Tile
      label="Wind"
      note={f.now.beaufort}
      value={
        <>
          <Speed ms={f.now.windMs} /> {f.now.windCompass}
        </>
      }
    >
      <svg role="img" aria-label={`Wind from the ${f.now.windCompass}, ${f.now.beaufort.toLowerCase()}`} viewBox="0 0 80 80" className="h-16 w-16 self-center md:h-[88px] md:w-[88px]">
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <circle cx="40" cy="6" r="3" fill="currentColor" fillOpacity="0.5" />
        <g className="r-rot" style={{ "--deg": `${to}deg`, transformOrigin: "40px 40px" } as CSSProperties}>
          <path d="M40 14 L49 48 L40 42 L31 48 Z" fill="currentColor" />
        </g>
      </svg>
    </Tile>
  );
}

export function SunTile({ f }: { f: Forecast }) {
  const s = f.sun;
  const p = s.progress;
  const value =
    s.mode === "polarDay" ? (
      "Up all day"
    ) : s.mode === "polarNight" ? (
      "Down all day"
    ) : s.next ? (
      <>
        {s.nextKind === "set" ? "Sets " : "Rises "}
        <Clk t={s.next} />
      </>
    ) : (
      "No sunrise today"
    );
  return (
    <Tile label="Sun" value={value} note={s.dayLength ? `${s.dayLength.replace(" min", " m")} of daylight` : undefined}>
      <svg
        role="img"
        aria-label={s.next ? `Sun ${s.nextKind === "set" ? "sets" : "rises"} at ${s.next.h24}` : String(value)}
        viewBox="0 0 140 80"
        preserveAspectRatio="xMidYMax meet"
        className="h-[58px] w-full md:h-[84px]"
      >
        <path d="M10,72 A60,60 0 0 1 130,72" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="3 5" />
        <path
          className="r-dash"
          d="M10,72 A60,60 0 0 1 130,72"
          fill="none"
          stroke="var(--bar)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="188.5"
          style={{ "--dash-to": 188.5 * (1 - p), "--dash-from": 188.5 } as CSSProperties}
        />
        <line x1="0" y1="72.5" x2="140" y2="72.5" stroke="currentColor" strokeOpacity="0.25" />
        <g className="r-rot" style={{ "--deg": `${p * 180}deg`, transformOrigin: "70px 72px" } as CSSProperties}>
          <circle cx="10" cy="72" r="7" fill="var(--bar)" />
        </g>
      </svg>
    </Tile>
  );
}

export function HumidityTile({ f }: { f: Forecast }) {
  return (
    <Tile
      label="Humidity"
      value={`${f.now.humidity}%`}
      note={
        <>
          Dew point <T c={f.now.dew} />
        </>
      }
    >
      <div
        role="img"
        aria-label={`Humidity ${f.now.humidity} percent`}
        className="relative h-[60px] w-[60px] self-center overflow-hidden rounded-full shadow-[inset_0_0_0_2px_var(--rule)] md:h-[84px] md:w-[84px]"
      >
        <span className="r-y absolute inset-x-0 bottom-0 bg-rain-bar" style={{ height: `${f.now.humidity}%` }} />
      </div>
    </Tile>
  );
}

export function FeelsTile({ f }: { f: Forecast }) {
  const d = f.now.feels - f.now.temp;
  const why = d <= -2 ? (f.now.windMs >= 4 ? "Wind makes it feel colder" : "Feels colder than it is") : d >= 2 ? "Humidity makes it feel warmer" : "Close to the actual temperature";
  const lo = Math.min(f.now.feels, f.now.temp) - 5;
  const hi = Math.max(f.now.feels, f.now.temp) + 5;
  const pos = (t: number) => ((t - lo) / (hi - lo)) * 100;
  const a = Math.min(pos(f.now.feels), pos(f.now.temp));
  const b = Math.max(pos(f.now.feels), pos(f.now.temp));
  return (
    <Tile label="Feels like" value={<T c={f.now.feels} />} note={why}>
      <div role="img" aria-label={`Feels like ${f.now.feels}°C, actual ${f.now.temp}°C. ${why}`} className="relative mx-1 h-12 text-[11px] text-p-muted md:h-16">
        <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: `${pos(f.now.temp)}%` }}>
          Actual
        </span>
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[3px] bg-rule" />
        <span className="r-x absolute top-1/2 h-1.5 -translate-y-1/2 rounded-[3px] bg-bar" style={{ left: `${a}%`, width: `${Math.max(b - a, 1)}%` }} />
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-current bg-panel" style={{ left: `${pos(f.now.temp)}%` }} />
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bar" style={{ left: `${pos(f.now.feels)}%` }} />
        <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap" style={{ left: `${pos(f.now.feels)}%` }}>
          Feels
        </span>
      </div>
    </Tile>
  );
}

export function UvTile({ f }: { f: Forecast }) {
  if (!f.uv) {
    return (
      <Tile label="UV index" value="Not available" note="Not in this forecast run">
        <div className="relative mx-1 h-6">
          <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[3px] bg-rule" />
        </div>
      </Tile>
    );
  }
  const peak = f.uv.peak;
  return (
    <Tile
      label="UV index"
      value={`${Math.round(peak)} · ${f.uv.level}`}
      note={
        f.uv.peakAt ? (
          <>
            Peak at <Clk t={f.uv.peakAt} />, clear sky
          </>
        ) : (
          "Clear-sky estimate"
        )
      }
    >
      <div role="img" aria-label={`UV index peak ${peak}, ${f.uv.level}. Clear-sky estimate`} className="relative mx-1 h-6">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[3px] bg-[linear-gradient(90deg,#5DBB63_0%,#E9D34B_30%,#F29A3B_55%,#E0533D_80%,#9D5BD2_100%)] opacity-85" />
        <span
          className="r-fade absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-p-ink shadow"
          style={{ left: `${Math.min(peak / 12, 1) * 100}%` }}
        />
      </div>
    </Tile>
  );
}

export function PressureTile({ f }: { f: Forecast }) {
  const p = f.now.pressure;
  const deg = Math.max(-120, Math.min(120, ((p - 1013) / 40) * 120));
  const trend =
    f.now.pressureTrend === "steady" ? "Steady over the next 3 h" : `${f.now.pressureTrend === "rising" ? "Rising" : "Falling"} ${Math.abs(f.now.pressureDelta)} hPa in 3 h`;
  return (
    <Tile label="Pressure" value={<Pressure hpa={p} />} note={trend}>
      <svg role="img" aria-label={`Pressure ${p} hectopascals, ${trend.toLowerCase()}`} viewBox="0 0 80 52" className="h-14 w-20 self-center md:h-[76px] md:w-28">
        <path d="M8 46 A32 32 0 1 1 72 46" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="2 4" />
        <g className="r-rot" style={{ "--deg": `${deg}deg`, transformOrigin: "40px 40px" } as CSSProperties}>
          <path d="M40 12 L43 40 L37 40 Z" fill="var(--bar)" />
        </g>
        <circle cx="40" cy="40" r="4" fill="currentColor" />
      </svg>
    </Tile>
  );
}

export function CloudTile({ f }: { f: Forecast }) {
  const c = f.now.clouds;
  const rows: [string, number][] = [
    ["High", c.high],
    ["Mid", c.mid],
    ["Low", c.low],
  ];
  const main = rows.reduce((m, r) => (r[1] > m[1] ? r : m), rows[0]);
  const note = f.now.fog > 0 ? `Fog covers ${f.now.fog}%` : c.total < 10 ? "Clear skies" : `Mostly ${main[0].toLowerCase()} cloud`;
  return (
    <Tile label="Cloud cover" value={`${c.total}%`} note={note}>
      <div role="img" aria-label={`Cloud cover ${c.total} percent: high ${c.high}, mid ${c.mid}, low ${c.low}`} className="flex flex-col gap-1.5">
        {rows.map(([name, v], i) => (
          <div key={name} className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-2 text-[11px] text-p-muted">
            <span>{name}</span>
            <span className="relative h-1.5 rounded-[3px] bg-rule">
              <span className="r-x absolute inset-y-0 left-0 rounded-[3px] bg-bar" style={{ width: `${v}%`, "--i": i } as CSSProperties} />
            </span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

function moonPath(phase: number, r = 26, cx = 30, cy = 30) {
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const waxing = phase < 0.5;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (k > 0 ? 0 : 1) : k > 0 ? 1 : 0;
  return `M${cx},${cy - r} A${r},${r} 0 0 ${outer} ${cx},${cy + r} A${rx.toFixed(2)},${r} 0 0 ${inner} ${cx},${cy - r} Z`;
}

export function MoonTile({ f }: { f: Forecast }) {
  return (
    <div className="col-span-2 flex h-[120px] items-center gap-5 rounded-[20px] bg-tile px-4 py-3.5 md:col-span-1 md:h-[212px] md:flex-col md:items-stretch md:justify-between md:gap-0 md:rounded-3xl md:px-5 md:py-[18px]">
      <span className="hidden text-sm text-p-muted md:block">Moon</span>
      <svg role="img" aria-label={`${f.moon.name}, ${f.moon.illumination} percent illuminated`} viewBox="0 0 60 60" className="h-16 w-16 shrink-0 md:h-[84px] md:w-[84px] md:self-center">
        <circle cx="30" cy="30" r="26" fill="currentColor" fillOpacity="0.1" />
        <path className="r-fade" d={moonPath(f.moon.phase)} fill="#F1E6C8" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[13px] text-p-muted md:hidden">Moon</span>
        <span className="text-lg font-semibold md:text-xl">{f.moon.name}</span>
        <span className="text-xs text-p-muted md:text-[13px]">{f.moon.illumination}% illuminated</span>
      </div>
    </div>
  );
}
