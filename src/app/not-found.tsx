import { ProsePage } from "@/components/prose-page";
import { NavLink } from "@/components/nav-link";

export default function NotFound() {
  return (
    <ProsePage title="We couldn't find that place">
      <p>The page may have moved, or the place name in the link is misspelled.</p>
      <p>
        <NavLink href="/places" className="inline-flex h-11 items-center rounded-full bg-night-ink px-5 font-semibold text-night no-underline">
          Search for a city
        </NavLink>
      </p>
    </ProsePage>
  );
}
