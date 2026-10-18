"use client";

import { usePathname } from "next/navigation";
import { MessageSquare, Phone } from "lucide-react";
import { formatPhone } from "@/content/property";
import EnquireLink from "./EnquireLink";

/**
 * Bar pinned to the bottom of every public page: the number to call on the
 * left, the enquiry button on the right (the style the Home page bar had
 * before it went site-wide). Wraps rather than shrinks on narrow phones.
 * Hidden on the page that already has the form on screen.
 *
 * Links arrive as props because this is a client component (it needs the
 * pathname) and the numbers live in content/property.ts — the server layout
 * reads them there and passes them in; nothing is typed here.
 */
export default function StickyEnquiryBar({
  phone,
  enquiryHref,
}: {
  phone: string | null;
  enquiryHref: string;
}) {
  const pathname = usePathname() ?? "";
  const formPath = enquiryHref.split("#")[0];
  if (pathname.replace(/\/$/, "") === formPath) return null;

  return (
    <div className="bg-canopy" style={{ position: "sticky", bottom: 0, zIndex: 30 }}>
      <div
        className="shell flex flex-wrap items-center justify-between gap-4"
        style={{ paddingBlock: "0.75rem" }}
      >
        {phone ? (
          <a href={`tel:${phone}`} className="footer-link text-fine with-icon">
            <Phone className="icon" aria-hidden="true" />
            Call {formatPhone(phone)}
          </a>
        ) : null}
        <EnquireLink href={enquiryHref} className="btn btn-invert pulse-ring">
          <MessageSquare className="icon" aria-hidden="true" />
          Send enquiry
        </EnquireLink>
      </div>
    </div>
  );
}
