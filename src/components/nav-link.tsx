"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href" | "prefetch"> & { href: string; dir?: "forward" | "back" };

const warmed = new Set<string>();

export function NavLink({ href, dir, onPointerEnter, onFocus, onTouchStart, ...rest }: Props) {
  const router = useRouter();
  const warm = () => {
    if (warmed.has(href)) return;
    warmed.add(href);
    router.prefetch(href);
  };
  return (
    <Link
      href={href}
      prefetch={false}
      transitionTypes={dir ? [dir === "forward" ? "nav-forward" : "nav-back"] : undefined}
      onPointerEnter={(e) => {
        warm();
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
