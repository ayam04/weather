import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionRuntime } from "@/components/motion-runtime";
import { PREFS_SCRIPT } from "@/components/units";
import { SITE } from "@/lib/site";
import "./globals.css";

const font = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const token = (v?: string) => (v?.match(/content=["']([^"']+)["']/)?.[1] ?? v)?.trim() || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Weather today: hourly and 9-day forecast", template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.shortName,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  verification: {
    google: token(process.env.GOOGLE_SITE_VERIFICATION),
    other: token(process.env.BING_SITE_VERIFICATION) ? { "msvalidate.01": token(process.env.BING_SITE_VERIFICATION)! } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1020",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>
        {children}
        <MotionRuntime />
        <Analytics />
      </body>
    </html>
  );
}
