import { MessageCircle, MessageSquare, Phone } from "lucide-react";
import { formatPhone } from "@/content/property";
import EnquireLink from "./EnquireLink";

/**
 * Bar pinned to the bottom of every public page — the Home page's original
 * bar, site-wide: Call and WhatsApp as plain text links on the left, the
 * animated Send enquiry button on the right. Wraps rather than shrinks on
 * narrow phones.
 *
 * The numbers live in content/property.ts — the layout reads them there and
 * passes them in; nothing is typed here.
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
  return (
    <div className="bg-canopy" style={{ position: "sticky", bottom: 0, zIndex: 30 }}>
      <div
        className="shell flex flex-wrap items-center justify-between gap-4"
        style={{ paddingBlock: "0.75rem" }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {phone ? (
            <a href={`tel:${phone}`} className="footer-link text-fine with-icon">
              <Phone className="icon" aria-hidden="true" />
              Call {formatPhone(phone)}
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link text-fine with-icon"
            >
              <MessageCircle className="icon" aria-hidden="true" />
              WhatsApp
            </a>
          ) : null}
        </div>
        <EnquireLink href={enquiryHref} className="btn btn-invert pulse-ring">
          <MessageSquare className="icon" aria-hidden="true" />
          Send enquiry
        </EnquireLink>
      </div>
    </div>
  );
}
