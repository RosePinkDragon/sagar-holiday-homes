"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { route: string; label: string };

/** trailingSlash is on, so "/villa/" must match the route "/villa". */
const normalise = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/**
 * Desktop flat nav. Split out of Header so the header can stay a server
 * component while the active page still gets its underline.
 */
export default function NavLinks({ items }: { items: NavItem[] }) {
  const current = normalise(usePathname());

  return (
    <nav
      aria-label="Primary"
      className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-1"
    >
      {items.map(({ route, label }) => (
        <Link
          key={route}
          href={route}
          className="nav-link"
          aria-current={current === route ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
