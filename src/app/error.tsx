"use client";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-start justify-center gap-4 bg-night px-6 text-night-ink md:px-10">
      <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.02em]">The forecast didn&apos;t load</h1>
      <p className="max-w-md text-night-muted">The weather service may be slow right now. Your saved places are safe on this device.</p>
      <button type="button" onClick={() => retry()} className="h-11 rounded-full bg-night-ink px-5 font-semibold text-night">
        Try again
      </button>
    </div>
  );
}
