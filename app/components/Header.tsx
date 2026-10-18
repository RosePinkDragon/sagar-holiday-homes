import Link from "next/link";
import { enquiryHref, identity, routes } from "@/content/property";
import MobileNav from "./MobileNav";
import EnquireLink from "./EnquireLink";
import NavLinks from "./NavLinks";

/**
 * `routes` (content/property.ts) is plain path strings with no display name
 * attached — BRIEF §8's site-map table is the only place these labels exist.
 * Kept here rather than in content/property.ts: this is nav copy tied to a
 * route, not a property fact (rate, dimension, amenity, phone number, ...).
 */
const NAV_LABELS: Record<string, string> = {
  "/": "Home",
  "/villa": "Villa",
  "/pool-and-grounds": "Pool & Grounds",
  "/gallery": "Gallery",
  "/food": "Food",
  "/location": "Location",
  "/tariff": "Tariff",
  "/faq": "FAQ",
};

export default function Header() {
  // /contact is a forwarding page now (the form lives on /tariff).
  const navItems = routes.filter((route) => route !== "/contact").map((route) => ({
    route,
    label: NAV_LABELS[route] ?? route,
  }));

  return (
    <header className="bg-bone" style={{ borderBottom: "1px solid var(--hairline)" }}>
      {/* text -- tabs -- button. From 1280px a three-column grid with equal
          outer columns keeps the tabs on the page's true centre; below that
          there is no tab row, so it is the wordmark on the left and the
          Enquire button and hamburger on the right. Below 1280px the nav is a
          hamburger + right-side drawer (client component); from 1280px it is a
          flat nav. Only one of the two is ever in the accessibility tree:
          `hidden`/`xl:hidden` remove the other from it, not just from view.
          Enquire shows from 768px; phones get the bottom bar. */}
      <div className="shell flex items-center justify-between gap-4 py-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/"
          className="type-display site-logo shrink-0 whitespace-nowrap"
        >
          {identity.name}
        </Link>

        <NavLinks items={navItems} />

        <div className="flex items-center gap-3 xl:justify-self-end">
          <EnquireLink href={enquiryHref} className="btn btn-solid hidden md:inline-flex shrink-0">
            Enquire
          </EnquireLink>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
