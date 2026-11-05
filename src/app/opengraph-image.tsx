import { brandOgImage, OG_SIZE } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${SITE.name}: the forecast, and the best time to go`;

export default function Image() {
  return brandOgImage();
}
