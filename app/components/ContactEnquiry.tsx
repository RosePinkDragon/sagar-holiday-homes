import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  contact,
  formatPhone,
  resolved,
  whatsAppLink,
} from "@/content/property";
import EnquiryForm from "./EnquiryForm";

/**
 * Contact details on the left, the enquiry form on the right (form first on
 * phones, where the call/WhatsApp bar already covers the quick routes).
 * Lives at the foot of /tariff; id="enquiry" is where every Enquire button
 * lands (`enquiryHref` in content/property.ts).
 */
export default function ContactEnquiry() {
  const phone = resolved(contact.phone);
  const email = resolved(contact.email);
  const callback = resolved(contact.callbackWindow);
  const address = resolved(contact.address);
  const wa = whatsAppLink();

  return (
    <section
      id="enquiry"
      tabIndex={-1}
      className="section bg-bone"
      style={{ scrollMarginTop: "1rem", outline: "none" }}
    >
      <div className="shell">
        <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
          Enquire or call
        </h2>
        <p className="measure mt-4">
          Phone is the fastest way to reach us.
          {callback ? ` ${callback.confirmationLine}` : ""}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 space-y-6 lg:order-1">
            {phone ? (
              <div className="hairline p-6">
                <p className="label with-icon"><Phone className="icon" aria-hidden="true" />Phone</p>
                <p className="mt-2">
                  <a
                    href={`tel:${phone}`}
                    className="type-display"
                    style={{ fontSize: "var(--step-1)" }}
                  >
                    {formatPhone(phone)}
                  </a>
                </p>
                {callback ? (
                  <p className="muted mt-2 text-fine">{callback.display}</p>
                ) : null}
              </div>
            ) : null}

            {wa ? (
              <div className="hairline p-6">
                <p className="label with-icon"><MessageCircle className="icon" aria-hidden="true" />WhatsApp</p>
                <p className="mt-2">
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-display"
                    style={{ fontSize: "var(--step-1)" }}
                  >
                    Chat on WhatsApp
                  </a>
                </p>
              </div>
            ) : null}

            {email ? (
              <div className="hairline p-6">
                <p className="label with-icon"><Mail className="icon" aria-hidden="true" />Email</p>
                <p className="mt-2">
                  <a
                    href={`mailto:${email}`}
                    className="type-display"
                    style={{ fontSize: "var(--step-1)", overflowWrap: "anywhere" }}
                  >
                    {email}
                  </a>
                </p>
              </div>
            ) : null}

            {address ? (
              <div className="hairline p-6">
                <p className="label with-icon"><MapPin className="icon" aria-hidden="true" />Address</p>
                <p className="mt-2">{address.lines.join(", ")}</p>
                <p className="mt-2 text-fine">
                  See the{" "}
                  <Link href="/location" className="link">
                    location page
                  </Link>{" "}
                  for drive times and the map.
                </p>
              </div>
            ) : null}
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="type-display" style={{ fontSize: "var(--step-1)" }}>
              Send an enquiry
            </h3>
            <p className="measure mt-3 text-fine">
              Phone is required so we can call you back; email is optional.
            </p>
            <div className="mt-8">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
