export type SceneKey = "day" | "night" | "cloudy" | "cloudyNight" | "rain" | "rainNight" | "storm" | "snow" | "snowNight";

export type Palette = {
  sky: string;
  ink: string;
  panel: string;
  pInk: string;
  pMuted: string;
  rule: string;
  tile: string;
  bar: string;
  rainBar: string;
  sun: string;
  cloudBack: string;
  cloudFront: string;
  drop: string;
};

export type Layers = {
  stars: number;
  moon: number;
  sun: number;
  sunRings: [number, number];
  rays: number;
  clouds: "none" | "dry" | "light" | "heavy" | "snow";
  bolt: boolean;
};

export type Scene = { key: SceneKey; palette: Palette; layers: Layers };

const base = {
  drop: "#D7E6F2",
  sun: "#FFD54A",
};

export const PALETTES: Record<SceneKey, Palette> = {
  night: {
    ...base,
    sky: "#101A33",
    ink: "#F3EFE6",
    panel: "#0A1124",
    pInk: "#F3EFE6",
    pMuted: "#9AA6BF",
    rule: "rgba(243,239,230,0.12)",
    tile: "rgba(243,239,230,0.05)",
    bar: "#F1E6C8",
    rainBar: "#7FA8D1",
    cloudBack: "#2A3550",
    cloudFront: "#36425C",
  },
  day: {
    ...base,
    sky: "#8EC5EA",
    ink: "#0B2238",
    panel: "#F5F9FC",
    pInk: "#0B2238",
    pMuted: "#4A6076",
    rule: "rgba(11,34,56,0.10)",
    tile: "rgba(11,34,56,0.04)",
    bar: "#F2A93B",
    rainBar: "#5C9BD1",
    cloudBack: "#D9E7F1",
    cloudFront: "#F4F8FB",
  },
  cloudy: {
    ...base,
    sky: "#AEB9C3",
    ink: "#1D2730",
    panel: "#EEF1F4",
    pInk: "#1D2730",
    pMuted: "#56626E",
    rule: "rgba(29,39,48,0.10)",
    tile: "rgba(29,39,48,0.045)",
    bar: "#7E8C99",
    rainBar: "#6F8FB0",
    sun: "#F4E2A0",
    cloudBack: "#D9DFE5",
    cloudFront: "#F4F6F8",
  },
  cloudyNight: {
    ...base,
    sky: "#1E2840",
    ink: "#F3EFE6",
    panel: "#111829",
    pInk: "#F3EFE6",
    pMuted: "#A3AEC4",
    rule: "rgba(243,239,230,0.12)",
    tile: "rgba(243,239,230,0.05)",
    bar: "#C9CFDC",
    rainBar: "#7FA8D1",
    cloudBack: "#2B3550",
    cloudFront: "#3B4762",
  },
  rain: {
    ...base,
    sky: "#4E5D6E",
    ink: "#F4F7FA",
    panel: "#232E3B",
    pInk: "#EEF3F7",
    pMuted: "#A8B6C4",
    rule: "rgba(238,243,247,0.12)",
    tile: "rgba(238,243,247,0.05)",
    bar: "#8FB8DA",
    rainBar: "#8FB8DA",
    sun: "#E9C46A",
    cloudBack: "#3F4B58",
    cloudFront: "#6D7B8A",
  },
  rainNight: {
    ...base,
    sky: "#2A3441",
    ink: "#F4F7FA",
    panel: "#161D27",
    pInk: "#EEF3F7",
    pMuted: "#A3B1C0",
    rule: "rgba(238,243,247,0.12)",
    tile: "rgba(238,243,247,0.05)",
    bar: "#8FB8DA",
    rainBar: "#8FB8DA",
    cloudBack: "#222B37",
    cloudFront: "#3C4858",
  },
  storm: {
    ...base,
    sky: "#232836",
    ink: "#F1F1F4",
    panel: "#14171F",
    pInk: "#F1F1F4",
    pMuted: "#A0A4B3",
    rule: "rgba(241,241,244,0.12)",
    tile: "rgba(241,241,244,0.05)",
    bar: "#FFD54A",
    rainBar: "#8FB8DA",
    cloudBack: "#2E3444",
    cloudFront: "#454D60",
  },
  snow: {
    ...base,
    sky: "#C3CEDA",
    ink: "#1B2632",
    panel: "#F2F5F8",
    pInk: "#1B2632",
    pMuted: "#55626F",
    rule: "rgba(27,38,50,0.10)",
    tile: "rgba(27,38,50,0.045)",
    bar: "#7FA0C2",
    rainBar: "#7FA0C2",
    sun: "#F4E2A0",
    cloudBack: "#A9B6C4",
    cloudFront: "#E6EBF1",
    drop: "#FFFFFF",
  },
  snowNight: {
    ...base,
    sky: "#1F2A3A",
    ink: "#EEF2F6",
    panel: "#131B27",
    pInk: "#EEF2F6",
    pMuted: "#A3B0BF",
    rule: "rgba(238,242,246,0.12)",
    tile: "rgba(238,242,246,0.05)",
    bar: "#C9D8E8",
    rainBar: "#9FBEDB",
    cloudBack: "#2C394B",
    cloudFront: "#46566B",
    drop: "#E8EEF5",
  },
};

const LAYERS: Record<SceneKey, Layers> = {
  night: { stars: 1, moon: 1, sun: 0, sunRings: [0, 0], rays: 0, clouds: "none", bolt: false },
  day: { stars: 0, moon: 0, sun: 1, sunRings: [0.18, 0.32], rays: 0.9, clouds: "none", bolt: false },
  cloudy: { stars: 0, moon: 0, sun: 1, sunRings: [0.1, 0.18], rays: 0, clouds: "dry", bolt: false },
  cloudyNight: { stars: 0.45, moon: 1, sun: 0, sunRings: [0, 0], rays: 0, clouds: "dry", bolt: false },
  rain: { stars: 0, moon: 0, sun: 0, sunRings: [0, 0], rays: 0, clouds: "light", bolt: false },
  rainNight: { stars: 0, moon: 0, sun: 0, sunRings: [0, 0], rays: 0, clouds: "light", bolt: false },
  storm: { stars: 0, moon: 0, sun: 0, sunRings: [0, 0], rays: 0, clouds: "heavy", bolt: true },
  snow: { stars: 0, moon: 0, sun: 0, sunRings: [0, 0], rays: 0, clouds: "snow", bolt: false },
  snowNight: { stars: 0.3, moon: 0, sun: 0, sunRings: [0, 0], rays: 0, clouds: "snow", bolt: false },
};

export function scene(key: SceneKey, opts: { sunHidden?: boolean; heavy?: boolean; thunder?: boolean } = {}): Scene {
  const layers = { ...LAYERS[key] };
  if (opts.sunHidden && (key === "cloudy" || key === "cloudyNight")) {
    layers.sun = 0;
    layers.moon = 0;
    layers.stars = 0;
  }
  if (opts.heavy && (key === "rain" || key === "rainNight")) layers.clouds = "heavy";
  if (opts.thunder) layers.bolt = true;
  return { key, palette: PALETTES[key], layers };
}

export function paletteVars(p: Palette): Record<string, string> {
  return {
    "--sky": p.sky,
    "--ink": p.ink,
    "--panel": p.panel,
    "--p-ink": p.pInk,
    "--p-muted": p.pMuted,
    "--rule": p.rule,
    "--tile": p.tile,
    "--bar": p.bar,
    "--rain-bar": p.rainBar,
    "--sun": p.sun,
    "--cloud-back": p.cloudBack,
    "--cloud-front": p.cloudFront,
    "--drop": p.drop,
  };
}
