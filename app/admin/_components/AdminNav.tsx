"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { identity } from "@/content/property";
import { signOut } from "@/lib/admin/queries";

const LINKS = [
  { href: "/admin/", label: "Calendar" },
  { href: "/admin/bookings/", label: "Bookings" },
  { href: "/admin/enquiries/", label: "Enquiries" },
] as const;

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) =>
    href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.slice(0, -1));

  return (
    <header className="bg-canopy-deep text-bone">
      <div className="shell flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <p className="font-semibold">
          {identity.name} <span className="opacity-75">· Admin</span>
        </p>
        <div className="flex items-center gap-3 text-fine">
          <span className="hidden sm:inline opacity-75">{email}</span>
          <button
            type="button"
            className="underline underline-offset-4"
            style={{ minHeight: 44 }}
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
      <nav aria-label="Admin" className="shell flex overflow-x-auto pb-2 sm:gap-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
            className="flex items-center whitespace-nowrap px-2 font-semibold sm:px-3"
            style={{
              minHeight: 44,
              borderBottom: isActive(l.href) ? "3px solid var(--alphonso)" : "3px solid transparent",
            }}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/admin/booking/?new=booking"
          className="ml-auto flex items-center whitespace-nowrap px-2 font-semibold sm:px-3"
          style={{ minHeight: 44 }}
        >
          + New<span className="hidden sm:inline">&nbsp;booking</span>
        </Link>
      </nav>
    </header>
  );
}
