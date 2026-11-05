"use client";

import { NIGHT_SKY } from "@/lib/site";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 24, background: NIGHT_SKY, color: "#f3efe6", fontFamily: "system-ui, sans-serif" }}>
        <title>The forecast didn&apos;t load</title>
        <h1>The forecast didn&apos;t load</h1>
        <p>The weather service may be slow right now. Your saved places are safe on this device.</p>
        <button type="button" onClick={() => retry()}>
          Try again
        </button>
      </body>
    </html>
  );
}
