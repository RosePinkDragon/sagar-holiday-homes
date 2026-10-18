"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MessageSquare, Phone } from "lucide-react";

/**
 * Phone-only bar pinned to the bottom of every public page: one tap to call,
 * WhatsApp or reach the form. Hidden from 768px up, where the header carries
 * an Enquire button, and on the page that already has the form on screen.
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
    <div
      className="bg-canopy md:hidden"
      style={{ position: "sticky", bottom: 0, zIndex: 30 }}
    >
      <div
        className="shell flex items-center gap-2"
        style={{ paddingBlock: "0.5rem" }}
      >
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="btn btn-invert shrink-0"
            style={{ paddingInline: "0.85rem" }}
            aria-label="Call us"
          >
            <Phone className="icon" aria-hidden="true" />
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
          </a>
        ) : null}
        <Link href={enquiryHref} className="btn btn-invert pulse-ring min-w-0 flex-1">
          <MessageSquare className="icon" aria-hidden="true" />
          Enquire
        </Link>
      </div>
    </div>
  );
}
