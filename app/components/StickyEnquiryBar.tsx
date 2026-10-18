"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, MessageSquare, Phone } from "lucide-react";
import { formatPhone } from "@/content/property";
import EnquireLink from "./EnquireLink";

/**
 * Bar pinned to the bottom of every public page: one tap to call, WhatsApp or
 * reach the form. On phones Call and WhatsApp are icon-only so Enquire fits at
 * 360px; from 768px up the number and labels are written out. Hidden on the
 * page that already has the form on screen.
 *
 * Links arrive as props because this is a client component (it needs the
 * pathname) and the numbers live in content/property.ts — the server layout
 * reads them there and passes them in; nothing is typed here.
 */
export default function StickyEnquiryBar({
  phone,
  whatsapp,
  enquiryHref,
}: {
  phone: string | null;
  whatsapp: string | null;
  enquiryHref: string;
}) {
  const pathname = usePathname() ?? "";
  const formPath = enquiryHref.split("#")[0];
  if (pathname.replace(/\/$/, "") === formPath) return null;

  return (
    <div className="bg-canopy" style={{ position: "sticky", bottom: 0, zIndex: 30 }}>
      <div
        className="shell flex items-center gap-2 md:justify-between md:gap-4"
        style={{ paddingBlock: "0.5rem" }}
      >
        <div className="flex items-center gap-2 md:gap-6">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="btn btn-invert shrink-0"
              style={{ paddingInline: "0.85rem" }}
              aria-label={`Call ${formatPhone(phone)}`}
            >
              <Phone className="icon" aria-hidden="true" />
              <span className="hidden md:inline">Call {formatPhone(phone)}</span>
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-invert shrink-0"
              style={{ paddingInline: "0.85rem" }}
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="icon" aria-hidden="true" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          ) : null}
        </div>
        <EnquireLink
          href={enquiryHref}
          className="btn btn-invert pulse-ring min-w-0 flex-1 md:flex-none"
        >
          <MessageSquare className="icon" aria-hidden="true" />
          Send enquiry
        </EnquireLink>
      </div>
    </div>
  );
}
