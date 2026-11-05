export const isSlug = (s: string | null | undefined): s is string => !!s && /^[a-z0-9-]{2,80}$/.test(s);
