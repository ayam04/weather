import type { Clock } from "@/lib/forecast";

export const toF = (c: number) => Math.round((c * 9) / 5 + 32);

export function T({ c, deg = true }: { c: number; deg?: boolean }) {
  const s = deg ? "°" : "";
  return (
    <>
      <span className="um">
        {c}
        {s}
      </span>
      <span className="ui">
        {toF(c)}
        {s}
      </span>
    </>
  );
}

export function Speed({ ms }: { ms: number }) {
  return (
    <>
      <span className="um">{Math.round(ms * 3.6)} km/h</span>
      <span className="ui">{Math.round(ms * 2.23694)} mph</span>
    </>
  );
}

export function Precip({ mm, unit = true }: { mm: number; unit?: boolean }) {
  const inches = mm / 25.4;
  const i = inches === 0 ? "0" : inches < 0.01 ? "<0.01" : inches < 0.1 ? inches.toFixed(2) : inches.toFixed(1);
  const m = mm >= 10 ? Math.round(mm).toString() : mm.toString();
  return (
    <>
      <span className="um">
        {m}
        {unit && " mm"}
      </span>
      <span className="ui">
        {i}
        {unit && " in"}
      </span>
    </>
  );
}

export function Pressure({ hpa }: { hpa: number }) {
  return (
    <>
      <span className="um">{hpa} hPa</span>
      <span className="ui">{(hpa * 0.02953).toFixed(2)} inHg</span>
    </>
  );
}

export function Clk({ t }: { t: Clock }) {
  return (
    <>
      <span className="um">{t.h24}</span>
      <span className="ui">{t.h12}</span>
    </>
  );
}

export const PREFS_SCRIPT = `try{var d=document.documentElement,u=localStorage.getItem("u");if(u!=="m"&&u!=="i"){var l=(navigator.languages&&navigator.languages[0])||navigator.language||"";u=/-(US|LR|MM|BS|BZ|KY|PW|FM|MH)$/i.test(l)?"i":"m"}d.dataset.u=u;d.classList.add("js")}catch(e){}`;
