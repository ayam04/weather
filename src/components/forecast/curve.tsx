import { T } from "@/components/units";

export function Curve({ temps }: { temps: number[] }) {
  const W = 342;
  const H = 130;
  const top = 18;
  const bottom = 112;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(max - min, 2);
  const pts = temps.map((t, i) => [(i / (temps.length - 1)) * W, bottom - ((t - min) / span) * (bottom - top)] as const);
  const iMax = temps.indexOf(max);
  const iMin = temps.indexOf(min);
  const label = `Temperature over the next 24 hours: from ${Math.round(temps[0])}°C now, ${max === temps[0] ? "falling" : "peaking at " + Math.round(max) + "°C"}, lowest ${Math.round(min)}°C`;
  const pct = (i: number) => `${(i / (temps.length - 1)) * 100}%`;
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] text-p-muted md:text-sm">Next 24 hours</span>
      <div className="relative">
        <svg role="img" aria-label={label} width="100%" height="140" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="r-x block overflow-visible md:h-40">
          <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke="currentColor" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
          <polyline
            fill="none"
            stroke="var(--bar)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          />
        </svg>
        {[iMax, iMin].map((i, k) => (
          <span
            key={k}
            className="r-fade absolute -translate-x-1/2 text-xs font-semibold"
            style={{ left: pct(i), top: `${(pts[i][1] / H) * 100}%`, transform: `translate(-50%, ${k === 0 ? "-150%" : "40%"})` }}
          >
            <T c={Math.round(temps[i])} />
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[13px] text-p-muted">
        <span>Now</span>
        <span>+6h</span>
        <span>+12h</span>
        <span>+18h</span>
        <span>+24h</span>
      </div>
    </div>
  );
}
