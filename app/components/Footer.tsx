import { MapPin, MessageCircle, Phone } from "lucide-react";
import {
  brand,
  identity,
  contact,
  formatPhone,
  resolved,
  whatsAppLink,
} from "@/content/property";

export default function Footer() {
  const address = resolved(contact.address);
  const phone = resolved(contact.phone);
  const callback = resolved(contact.callbackWindow);
  const wa = whatsAppLink();

  return (
    <footer className="bg-canopy-deep text-bone">
      <div className="shell" style={{ paddingBlock: "clamp(2.5rem, 6vw, 4rem)" }}>
        <div className="flex items-center gap-4">
          {/* Decorative: the name beside it is the label. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo.src}
            srcSet={`${brand.logo.src} 1x, ${brand.logo.src2x} 2x`}
            width={brand.logo.size}
            height={brand.logo.size}
            alt=""
            style={{ width: "4.5rem", height: "4.5rem", flexShrink: 0 }}
          />
          <p className="type-display" style={{ color: "var(--bone)", fontSize: "var(--step-1)" }}>
            {identity.name}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mt-8">
          {address ? (
            <address className="with-icon" style={{ fontStyle: "normal", alignItems: "flex-start" }}>
              <MapPin className="icon" style={{ marginTop: "0.3em" }} aria-hidden="true" />
              <span>
              {/* lines[0] is the property name — already the heading above. */}
              {address.lines.slice(1).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              </span>
            </address>
          ) : null}

          <div>
            {phone ? (
              <p>
                <a href={`tel:${phone}`} className="footer-link with-icon">
                  <Phone className="icon" aria-hidden="true" />
                  {formatPhone(phone)}
                </a>
              </p>
            ) : null}

            {phone && callback ? (
              <p className="text-fine mt-1" style={{ color: "var(--bone-deep)" }}>
                {callback.confirmationLine}
              </p>
            ) : null}

            {wa ? (
              <p className="mt-3">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link with-icon"
                >
                  <MessageCircle className="icon" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
