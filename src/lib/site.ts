export const SITE = {
  name: "weather.ayamk.in",
  shortName: "Weather",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://weather.ayamk.in",
  description:
    "Live local weather with an hourly and 9-day forecast, sunrise, UV and wind, plus month-by-month climate averages to plan when to travel.",
  copyrightYear: 2026,
  contactEmail: "ayamullahkhan04@gmail.com",
  ads: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
};
