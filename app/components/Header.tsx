import Link from "next/link";
import { identity, routes } from "@/content/property";
import MobileNav from "./MobileNav";

/**
 * `routes` (content/property.ts) is plain path strings with no display name
 * attached — BRIEF §8's site-map table is the only place these labels exist.
 * Kept here rather than in content/property.ts: this is nav copy tied to a
 * route, not a property fact (rate, dimension, amenity, phone number, ...).
 */
const NAV_LABELS: Record<string, string> = {
  "/": "Home",
  "/villa": "The Villa",
  "/pool-and-grounds": "Pool & Grounds",
  "/gallery": "Gallery",
  "/food": "Food",
  "/location": "Location",
  "/tariff": "Tariff & Booking",
  "/contact": "Contact",
};

export default function Header() {
  const navItems = routes.map((route) => ({
    route,
    label: NAV_LABELS[route] ?? route,
  }));

  return (
    <header className="bg-bone" style={{ borderBottom: "1px solid var(--hairline)" }}>
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="type-display shrink-0"
          style={{ fontSize: "var(--step-1)" }}
        >
          {identity.name}
        </Link>

        {/* Mobile: hamburger + right-side drawer (client component).
            Desktop (md+, 768px): a separate flat nav, always visible. Only
            one of the two is ever in the accessibility tree at a time:
            `hidden`/`md:hidden` remove the other from it, not just from
            view. Between 768-1024px there isn't room for all 8 links (two
            of them multi-word) on one line, so the nav wraps onto a second
            row there instead of switching back to the hamburger — .nav-link
            keeps white-space: nowrap so it's whole links that wrap, never a
            link's own text mid-word. */}
        <MobileNav items={navItems} />

        <nav
          aria-label="Primary"
          className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-1"
        >
          {navItems.map(({ route, label }) => (
            <Link key={route} href={route} className="nav-link">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
