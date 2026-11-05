import { DEFAULT_PLACES, type Place } from "@/data/default-places";
import { isSlug } from "./slug";
import type { Snap } from "./snapshot";

export const FRESH_MS = 30 * 60 * 1000;
export const SEED_TOLERANCE_MS = FRESH_MS + 30 * 60 * 1000;

type Here = Place & { source?: "ip" | "gps" };
type PlacesState = { places: Place[]; here: Here | null; snaps: Record<string, Snap>; failed: Record<string, boolean> };

const read = <T>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const drop = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {}
};

const isPlace = (p: unknown): p is Place => {
  const x = p as Partial<Place> | null;
  return typeof x?.slug === "string" && isSlug(x.slug) && typeof x.name === "string";
};

const readSnap = (slug: string) => read<Snap>(`snap:${slug}`);
export const age = (s: Snap | null | undefined) => (s ? Date.now() - Date.parse(s.fetchedAt) : Infinity);
const isFresh = (s: Snap | null | undefined) => age(s) < FRESH_MS;

export function newer(a: Snap | null | undefined, b: Snap | null | undefined) {
  if (!a) return b ?? null;
  if (!b) return a;
  return Date.parse(a.fetchedAt) >= Date.parse(b.fetchedAt) ? a : b;
}

const SERVER: PlacesState = { places: [], here: null, snaps: {}, failed: {} };
let state: PlacesState | null = null;
const listeners = new Set<() => void>();
let storageBound = false;

function load(): PlacesState {
  const saved = read<unknown>("places");
  const valid = Array.isArray(saved) ? saved.filter(isPlace) : [];
  const places = valid.length ? valid : DEFAULT_PLACES;
  const stored = read<Here>("here");
  const here = isPlace(stored) ? stored : null;
  const snaps: Record<string, Snap> = {};
  for (const p of [...(here ? [here] : []), ...places]) {
    const s = readSnap(p.slug);
    if (s) snaps[p.slug] = s;
  }
  return { places, here, snaps, failed: state?.failed ?? {} };
}

const emit = () => listeners.forEach((l) => l());

function patch(next: Partial<PlacesState>) {
  state = { ...getPlacesState(), ...next };
  emit();
}

export function getPlacesState(): PlacesState {
  return (state ??= load());
}
export const getPlacesServerState = () => SERVER;

export function subscribePlaces(cb: () => void) {
  listeners.add(cb);
  if (!storageBound && typeof window !== "undefined") {
    storageBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key === null || e.key === "places" || e.key === "here" || e.key.startsWith("snap:")) {
        state = load();
        emit();
      }
    });
  }
  return () => {
    listeners.delete(cb);
  };
}

export function setPlaces(places: Place[]) {
  const st = getPlacesState();
  const keep = new Set([...places.map((p) => p.slug), st.here?.slug]);
  const snaps = { ...st.snaps };
  for (const p of st.places) {
    if (keep.has(p.slug)) continue;
    drop(`snap:${p.slug}`);
    delete snaps[p.slug];
  }
  write("places", places);
  patch({ places, snaps });
}

export function setHere(here: Here) {
  const cur = getPlacesState().here;
  if (cur?.slug === here.slug && cur.source === here.source) return;
  if (cur?.source === "gps" && here.source !== "gps") return;
  write("here", here);
  patch({ here });
}

function putSnap(s: Snap) {
  const st = getPlacesState();
  const cur = newer(st.snaps[s.slug], readSnap(s.slug));
  const failed = st.failed[s.slug] ? { ...st.failed, [s.slug]: false } : st.failed;
  if (newer(cur, s) !== s || cur?.fetchedAt === s.fetchedAt) {
    if (failed !== st.failed) patch({ failed });
    return;
  }
  write(`snap:${s.slug}`, s);
  patch({ snaps: { ...st.snaps, [s.slug]: s }, failed });
}

export function setFailed(slug: string, value: boolean) {
  const st = getPlacesState();
  if (!!st.failed[slug] === value) return;
  patch({ failed: { ...st.failed, [slug]: value } });
}

const inflight = new Map<string, Promise<Snap | null>>();

export function loadSnap(slug: string, force = false): Promise<Snap | null> {
  const cached = newer(state?.snaps[slug], readSnap(slug));
  if (!force && isFresh(cached)) return Promise.resolve(cached);
  const running = inflight.get(slug);
  if (running) return running;
  if (force) setFailed(slug, false);
  const p = fetch(`/api/now/${slug}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const snap = (await res.json()) as Snap;
      putSnap(snap);
      return snap;
    })
    .catch(() => {
      if (!newer(state?.snaps[slug], readSnap(slug))) setFailed(slug, true);
      return null;
    })
    .finally(() => inflight.delete(slug));
  inflight.set(slug, p);
  return p;
}

let defaultsInflight: Promise<void> | null = null;
const DEFAULT_SLUGS = new Set(DEFAULT_PLACES.map((p) => p.slug));

export function loadDefaults(): Promise<void> {
  defaultsInflight ??= fetch("/api/defaults")
    .then(async (res) => {
      if (!res.ok) return;
      const all = (await res.json()) as Record<string, Snap>;
      Object.values(all).forEach(putSnap);
    })
    .catch(() => {})
    .then(() => {
      const { snaps, places } = getPlacesState();
      for (const p of places) if (DEFAULT_SLUGS.has(p.slug) && !newer(snaps[p.slug], readSnap(p.slug))) void loadSnap(p.slug);
    })
    .finally(() => {
      defaultsInflight = null;
    });
  return defaultsInflight;
}

export function goodConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !(c?.saveData || c?.effectiveType === "2g" || c?.effectiveType === "slow-2g");
}

export function whenIdle(fn: () => void, timeout = 2500) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const t = setTimeout(fn, 600);
  return () => clearTimeout(t);
}

let idleReached = false;
let idleScheduled = false;
const idleListeners = new Set<() => void>();

export function subscribeIdle(cb: () => void) {
  idleListeners.add(cb);
  if (!idleScheduled) {
    idleScheduled = true;
    whenIdle(() => {
      idleReached = goodConnection();
      idleListeners.forEach((l) => l());
    });
  }
  return () => {
    idleListeners.delete(cb);
  };
}

export const getIdle = () => idleReached;
export const getIdleServer = () => false;
