import type { Icon } from "@/lib/forecast";

const CLOUD_HIGH = "M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 7.1 3.5 3.5 0 0 0 7 14z";

function paths(icon: Icon) {
  switch (icon) {
    case "sun":
      return (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </>
      );
    case "moon":
      return <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />;
    case "cloud":
      return <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.1 3.5 3.5 0 0 0 7 18z" />;
    case "sunCloud":
      return (
        <>
          <path d="M9 4.5a3.5 3.5 0 0 1 4.1 2.1M5.6 8.4A3.5 3.5 0 0 1 7.2 5M5.2 2.6l.7 1.2M1.8 6.2l1.2.6M9.7 1.4v1.3" />
          <path d="M8 20h9a3.6 3.6 0 0 0 .4-7.17A5.4 5.4 0 0 0 7.2 13.6 3.2 3.2 0 0 0 8 20z" />
        </>
      );
    case "moonCloud":
      return (
        <>
          <path d="M11.5 6.6A4.6 4.6 0 0 1 6 12.4a4.6 4.6 0 0 0-2.4-1.9A5 5 0 0 1 9.6 3a4 4 0 0 0 1.9 3.6z" />
          <path d="M8 20h9a3.6 3.6 0 0 0 .4-7.17A5.4 5.4 0 0 0 7.2 13.6 3.2 3.2 0 0 0 8 20z" />
        </>
      );
    case "fog":
      return (
        <>
          <path d={CLOUD_HIGH} />
          <path d="M4 17.5h16M6.5 21h11" />
        </>
      );
    case "rain":
      return (
        <>
          <path d={CLOUD_HIGH} />
          <path d="M8.5 17l-1 3M12.5 17l-1 3M16.5 17l-1 3" />
        </>
      );
    case "storm":
      return (
        <>
          <path d={CLOUD_HIGH} />
          <path d="M12.5 15.5l-2 3.5h3l-2 3.5" />
        </>
      );
    case "snow":
      return (
        <>
          <path d={CLOUD_HIGH} />
          <path d="M8 17.5v3M6.7 18.2l2.6 1.6M9.3 18.2l-2.6 1.6M16 17.5v3M14.7 18.2l2.6 1.6M17.3 18.2l-2.6 1.6" />
        </>
      );
    case "sleet":
      return (
        <>
          <path d={CLOUD_HIGH} />
          <path d="M8.5 17l-1 3M15.5 17v3M14.2 17.7l2.6 1.6M16.8 17.7l-2.6 1.6" />
        </>
      );
  }
}

export function WxIcon({ icon, size = 24, stroke = 1.7 }: { icon: Icon; size?: number; stroke?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="block shrink-0"
    >
      {paths(icon)}
    </svg>
  );
}

export function PinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="block shrink-0">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function ArrowIcon({ dir, size = 16 }: { dir: "up" | "down"; size?: number }) {
  return (
    <svg
      role="img"
      aria-label={dir === "up" ? "High" : "Low"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === "up" ? "M12 19V5M6 11l6-6 6 6" : "M12 5v14M6 13l6 6 6-6"} />
    </svg>
  );
}

export function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
