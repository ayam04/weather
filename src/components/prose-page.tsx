import { ViewTransition, type ReactNode } from "react";
import { BackIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { RootVars } from "@/components/root-vars";
import { SiteFooter } from "@/components/site-footer";

export function ProsePage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <ViewTransition update="none">
      <RootVars css="--sky:#0b1020;--ink:#f3efe6;--rule:rgba(243,239,230,0.12)" />
      <div className="min-h-svh bg-night px-4 pt-4 pb-14 text-night-ink md:px-10 md:pt-8">
        <div className="mx-auto max-w-[720px]">
          <header className="flex items-center gap-1" style={{ viewTransitionName: "site-header" }}>
            <NavLink href="/" dir="back" aria-label="Back to forecast" className="flex h-11 w-11 items-center justify-center rounded-full">
              <BackIcon />
            </NavLink>
            <span className="text-sm text-night-muted">Weather</span>
          </header>
          <h1 className="mt-6 text-[34px] leading-tight font-semibold tracking-[-0.02em] md:text-[44px]">{title}</h1>
          {updated && <p className="mt-2 text-sm text-night-muted">Last updated {updated}</p>}
          <div className="mt-8 flex flex-col gap-5 text-[17px] leading-relaxed text-night-ink/90 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-night-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
            {children}
          </div>
        </div>
      </div>
      <SiteFooter tone="night" />
    </ViewTransition>
  );
}
