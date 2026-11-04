"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href" | "prefetch"> & {
  href: string;
  dir?: "forward" | "back";
  eager?: boolean;
};

export function NavLink({ href, dir, eager = false, onPointerEnter, onFocus, onTouchStart, ...rest }: Props) {
  const [intent, setIntent] = useState(false);
  const full = eager || intent;
  return (
    <Link
      href={href}
      prefetch={full ? true : "auto"}
      transitionTypes={dir ? [dir === "forward" ? "nav-forward" : "nav-back"] : undefined}
      onPointerEnter={(e) => {
        setIntent(true);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
