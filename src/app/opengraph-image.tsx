import { brandOgImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "weather.ayamk.in: the forecast, and the best time to go";

export default function Image() {
  return brandOgImage();
}
