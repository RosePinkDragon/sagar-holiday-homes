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
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="type-display shrink-0"
          style={{ fontSize: "var(--step-1)" }}
        >
          {identity.name}
        </Link>

        {/* Below 1280px the nav is a hamburger + right-side drawer (client
            component); from 1280px it is a flat nav, always visible. Only one
            of the two is ever in the accessibility tree: `hidden`/`xl:hidden`
            remove the other from it, not just from view. Eight links, the
            wordmark and the Enquire button need roughly 1100px of content
            width, so anything narrower than 1280px used to wrap the nav onto
            a second row — the hamburger takes over there instead. Enquire
            stays visible from 768px; phones get the bottom bar. */}
        <div className="flex items-center gap-3">
          <NavLinks items={navItems} />
          <EnquireLink href={enquiryHref} className="btn btn-solid hidden md:inline-flex shrink-0">
            Enquire
          </EnquireLink>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
