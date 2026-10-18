import Link from "next/link";
import { enquiryHref, identity, navRoutes } from "@/content/property";
import EnquireLink from "./EnquireLink";
import MobileNav from "./MobileNav";
import NavLinks from "./NavLinks";
import SiteHeader from "./SiteHeader";

/**
 * `navRoutes` (content/property.ts) is plain path strings with no display name
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

/**
 * Two states, one set of elements (so there is only ever one nav in the
 * accessibility tree), switched by `data-compact` on the <header> — see
 * SiteHeader and the `.header-*` rules in globals.css:
 *
 *   top of page, 1280px+   [logo] Sagar Holiday Homes        [ Enquire ]
 *                          [    ] Home  Villa  Pool …
 *   scrolled               [logo] Home  Villa  Pool …        [ Enquire ]
 *
 * Below 1280px there is no link row: the nav is the hamburger + drawer, so
 * both states are a single row (the name drops out once scrolled).
 */
export default function Header() {
  const navItems = navRoutes.map((route) => ({ route, label: NAV_LABELS[route] ?? route }));

  return (
    <SiteHeader>
      <div className="shell header-grid">
        <Link href="/" className="header-logo" aria-label={identity.name}>
          {/* A static export serves public/ as-is, so next/image adds nothing here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-160.webp"
            srcSet="/brand/logo-160.webp 1x, /brand/logo-320.webp 2x"
            width={160}
            height={160}
            alt=""
          />
        </Link>

        {/* The logo link above already names the home link for assistive tech. */}
        <Link href="/" className="header-name type-display" tabIndex={-1} aria-hidden="true">
          {identity.name}
        </Link>

        <NavLinks items={navItems} />

        <div className="header-cta">
          <EnquireLink href={enquiryHref} className="btn btn-solid hidden md:inline-flex shrink-0">
            Enquire
          </EnquireLink>
          <MobileNav items={navItems} />
        </div>
      </div>
    </SiteHeader>
  );
}
