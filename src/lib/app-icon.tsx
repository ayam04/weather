import { ImageResponse } from "next/og";

export function appIcon(size: number, { maskable = false, rounded = true } = {}) {
  const pad = maskable ? size * 0.12 : 0;
  const s = (size - pad * 2) / 64;
  const sky = "#101A33";
  const dot = (x: number, y: number, r: number, color: string) => (
    <div style={{ position: "absolute", left: pad + (x - r) * s, top: pad + (y - r) * s, width: r * 2 * s, height: r * 2 * s, borderRadius: r * s, background: color }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: sky, borderRadius: rounded && !maskable ? size * 0.22 : 0 }}>
        {dot(38, 26, 13, "#F1E6C8")}
        {dot(44, 21, 11.5, sky)}
        {dot(22, 44, 8, "#3B4762")}
        {dot(32, 39, 10, "#3B4762")}
        {dot(42, 45, 7, "#3B4762")}
        <div style={{ position: "absolute", left: pad + 14 * s, top: pad + 44 * s, width: 36 * s, height: 9 * s, borderRadius: 4.5 * s, background: "#3B4762" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
