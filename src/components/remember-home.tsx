"use client";

import { useEffect } from "react";
import { setHere } from "@/lib/snap-store";

export function RememberHome({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    setHere({ slug, name, source: "ip" });
  }, [slug, name]);
  return null;
}
