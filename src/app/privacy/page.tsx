import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What this site stores, what it sends to others, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <ProsePage title="Privacy policy" updated="5 November 2026">
      <h2>What stays on your device</h2>
      <ul>
        <li>Your saved places, unit choice (°C or °F) and the last forecast for each saved place are kept in your browser&apos;s local storage. They never leave your device.</li>
        <li>If you choose &ldquo;Use my precise location&rdquo;, your browser asks for permission. We match your position to the nearest city on your device and keep only that city in a cookie called <code>home</code>, so the home page opens on it. Your coordinates are not sent to us.</li>
      </ul>
      <h2>What our host sees</h2>
      <p>
        The site is hosted on Vercel. Like any web host, it handles your IP address to deliver pages, and gives us an approximate location from it so the home
        page can show weather near you. We do not store that location or build a profile from it.
      </p>
      <h2>Analytics</h2>
      <p>
        We count visits with Vercel Web Analytics. It does not use cookies and does not identify you: visits are grouped using a hash that changes every day,
        and we see only totals such as page views, the pages visited, the referring site, country and device type. See{" "}
        <a href="https://vercel.com/docs/analytics/privacy-policy" rel="noopener">
          Vercel&apos;s analytics privacy policy
        </a>
        .
      </p>
      <h2>Advertising</h2>
      <p>
        We may later show ads from Google AdSense. If we do, Google may use cookies or similar technology to measure and personalise ads, and visitors in the
        European Economic Area, the UK and Switzerland will be asked for consent first through a certified consent tool. You can learn how Google uses data at{" "}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">
          policies.google.com/technologies/partner-sites
        </a>
        . This page will be updated before ads are switched on.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about privacy: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </ProsePage>
  );
}
