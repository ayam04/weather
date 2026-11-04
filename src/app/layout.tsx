import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Weather today: hourly and 9-day forecast", template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.shortName,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  other: process.env.GOOGLE_SITE_VERIFICATION ? { "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION } : {},
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
      </body>
    </html>
  );
}
