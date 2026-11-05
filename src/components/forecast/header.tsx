import { PinIcon, SearchIcon, WxIcon } from "@/components/icons";
import { NavLink } from "@/components/nav-link";
import { T } from "@/components/units";
import type { Icon } from "@/lib/forecast";

export function ForecastHeader({ name, slug, temp, icon }: { name: string; slug: string; temp: number; icon: Icon }) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 pt-4 pr-4 pl-6 text-ink md:gap-4 md:pt-6 md:pr-8 md:pl-10"
      style={{ viewTransitionName: "site-header" }}
    >
      <span
        aria-hidden
        className="px-headbg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[68px] bg-[color-mix(in_srgb,var(--panel)_94%,transparent)] opacity-0 shadow-[0_1px_0_var(--rule)] md:h-[92px] md:[--compact-from:340px] md:[--compact-to:440px]"
      />
      <NavLink
        href="/places"
        dir="forward"
        className="flex h-11 min-w-0 items-center gap-1.5 text-lg font-semibold no-underline md:gap-2 md:text-xl"
        aria-label={`${name}. Change place`}
      >
        <PinIcon size={16} />
        <span className="truncate" style={{ viewTransitionName: `city-${slug}` }}>
          {name}
        </span>
      </NavLink>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <span
          aria-hidden
          className="px-compact flex items-center gap-1.5 text-lg font-semibold opacity-0 md:text-[22px] md:[--compact-from:340px] md:[--compact-to:440px]"
        >
          <WxIcon icon={icon} size={20} stroke={1.8} />
          <T c={temp} />
        </span>
        <NavLink
          href="/places"
          dir="forward"
          aria-label="Search a city"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-rule transition-[background-color] duration-200 hover:bg-[color-mix(in_srgb,var(--rule)_60%,var(--ink)_14%)] md:w-auto md:gap-2 md:pr-[18px] md:pl-3.5 md:text-[15px] md:font-medium"
        >
          <SearchIcon size={18} />
          <span className="hidden md:inline">Search a city</span>
        </NavLink>
      </div>
    </header>
  );
}
