export const SITE = {
  name: "weather.ayamk.in",
  shortName: "Weather",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://weather.ayamk.in",
  description:
    "Live local weather with an hourly and 9-day forecast, sunrise, UV and wind, plus month-by-month climate averages to plan when to travel.",
  copyrightYear: 2026,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  ads: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
};

export const NIGHT_SKY = "#0b1020";
export const NIGHT_VARS = `--sky:${NIGHT_SKY};--ink:#f3efe6;--rule:rgba(243,239,230,0.12)`;
