import {
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
        <p className="type-display" style={{ color: "var(--bone)", fontSize: "var(--step-1)" }}>
          {identity.name}
        </p>

        <div className="grid gap-8 md:grid-cols-2 mt-8">
          {address ? (
            <address style={{ fontStyle: "normal" }}>
              {/* lines[0] is the property name — already the heading above. */}
              {address.lines.slice(1).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : null}

          <div>
            {phone ? (
              <p>
                <a href={`tel:${phone}`} className="footer-link">
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
                  className="footer-link"
                >
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
