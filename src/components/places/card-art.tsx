import type { SceneKey } from "@/lib/scenes";

export type CardLook = { sky: string; ink: string; muted: string; sun?: boolean; dimSun?: boolean; moon?: boolean; cloud?: string; rain?: boolean; snow?: boolean; bolt?: boolean };

export const CARD: Record<SceneKey, CardLook> = {
  night: { sky: "#172344", ink: "#F3EFE6", muted: "#B4BED2", moon: true },
  cloudyNight: { sky: "#1E2840", ink: "#F3EFE6", muted: "#B4BED2", moon: true, cloud: "#36425C" },
  day: { sky: "#8EC5EA", ink: "#0B2238", muted: "#22405A", sun: true },
  cloudy: { sky: "#AEB9C3", ink: "#1D2730", muted: "#3E4A56", sun: true, dimSun: true, cloud: "#F4F6F8" },
  rain: { sky: "#4E5D6E", ink: "#F4F7FA", muted: "#E1E7EE", cloud: "#6D7B8A", rain: true },
  rainNight: { sky: "#2A3441", ink: "#F4F7FA", muted: "#D2DAE3", cloud: "#4A5666", rain: true },
  storm: { sky: "#232836", ink: "#F1F1F4", muted: "#C9CCD6", cloud: "#454D60", rain: true, bolt: true },
  snow: { sky: "#C3CEDA", ink: "#1B2632", muted: "#3D4A57", cloud: "#E6EBF1", snow: true },
  snowNight: { sky: "#1F2A3A", ink: "#EEF2F6", muted: "#C3CDD8", cloud: "#46566B", snow: true },
};

const DROPS = [
  [56, -0, 0.8],
  [70, -0.3, 0.8],
  [84, -0.55, 0.8],
  [63, -0.7, 0.9],
] as const;

export function CardArt({ look, sunHidden }: { look: CardLook; sunHidden: boolean }) {
  const showSun = look.sun && !sunHidden;
  const showMoon = look.moon && !(sunHidden && look.cloud);
  return (
    <svg aria-hidden width="140" height="100" viewBox="0 0 140 100" className="absolute top-0 left-[44%]">
      {showSun && (
        <g opacity={look.dimSun ? 0.7 : 1}>
          <circle cx="70" cy="50" r="34" fill="#FFD54A" opacity="0.25">
            <animate attributeName="r" values="34;38;34" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="50" r="22" fill={look.dimSun ? "#F4E2A0" : "#FFD54A"} />
        </g>
      )}
      {showMoon && (
        <g>
          <circle cx="70" cy="48" r="18" fill="#F1E6C8" />
          <circle cx="80" cy="41" r="16" fill={look.sky} />
          <circle cx="28" cy="24" r="1.2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="110" cy="74" r="1.4" fill="#FFFFFF" opacity="0.6" />
          <circle cx="120" cy="20" r="1" fill="#FFFFFF" opacity="0.5" />
          <circle cx="18" cy="70" r="0.9" fill="#FFFFFF" opacity="0.5" />
        </g>
      )}
      {look.cloud && (
        <g fill={look.cloud}>
          <animateTransform attributeName="transform" type="translate" values="0 0; 6 0; 0 0" dur="8s" repeatCount="indefinite" />
          <circle cx="52" cy="62" r="14" />
          <circle cx="72" cy="52" r="20" />
          <circle cx="92" cy="63" r="13" />
          <rect x="38" y="61" width="68" height="16" rx="8" />
        </g>
      )}
      {look.rain && (
        <g stroke="#D7E6F2" strokeWidth="1.6" strokeLinecap="round">
          {DROPS.map(([x, begin, dur], i) => (
            <line key={i} x1={x} y1="76" x2={x - 2} y2="84" opacity="0">
              <animate attributeName="opacity" values="0;0.8;0" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-4 20" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      )}
      {look.snow && (
        <g fill="#FFFFFF">
          {DROPS.map(([x, begin], i) => (
            <circle key={i} cx={x} cy="78" r="1.8" opacity="0">
              <animate attributeName="opacity" values="0;0.9;0" dur="2.4s" begin={`${begin * 3}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0 0; 3 9; -2 18" dur="2.4s" begin={`${begin * 3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}
      {look.bolt && (
        <polygon points="74,64 66,82 72,82 67,96 82,76 75,76 80,64" fill="#FFD54A" opacity="0">
          <animate attributeName="opacity" values="0;0;1;0.2;1;0;0" keyTimes="0;0.6;0.63;0.66;0.7;0.76;1" dur="4.5s" repeatCount="indefinite" />
        </polygon>
      )}
    </svg>
  );
}
