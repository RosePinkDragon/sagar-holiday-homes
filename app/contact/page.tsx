import type { Metadata } from "next";
import Link from "next/link";
import {
  contact,
  formatPhone,
  pageMetadata,
  pages,
  resolved,
  whatsAppLink,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";
import EnquiryForm from "../components/EnquiryForm";

export function generateMetadata(): Metadata {
  return pageMetadata(pages.contact, "pages.contact");
}

export default function ContactPage() {
  const phone = resolved(contact.phone);
  const callback = resolved(contact.callbackWindow);
  const address = resolved(contact.address);
  const wa = whatsAppLink();

  return (
    <main>
      <HorizonBand
        caption="VILLA — front of the house, daytime"
        image={{ src: "/temp-stock/front-house-daytime.jpg", alt: "Stock photo standing in for the front of the house" }}
      />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Contact
        </h1>
        <p className="measure mt-6">
          Phone is the fastest way to reach us. The form below works too —
          {callback ? ` ${callback.confirmationLine.toLowerCase()}` : ""}
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Call or WhatsApp
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 mt-10">
            {phone ? (
              <div className="hairline p-6">
                <p className="label">Phone</p>
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
                  <p className="muted mt-2 text-fine">
                    {callback.confirmationLine}
                  </p>
                ) : null}
              </div>
            ) : null}

            {wa ? (
              <div className="hairline p-6">
                <p className="label">WhatsApp</p>
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
          </div>

          {address ? (
            <p className="measure mt-8">
              {address.lines.join(", ")}. See the{" "}
              <Link href="/location" className="link">
                location page
              </Link>{" "}
              for drive times and the map.
            </p>
          ) : null}
        </div>
      </section>

      <section className="section bg-bone">
        <div className="shell">
          <h2 className="type-display" style={{ fontSize: "var(--step-2)" }}>
            Send an enquiry
          </h2>
          <p className="measure mt-4 text-fine">
            Phone is required so we can call you back; email is optional.
          </p>
          <div className="mt-10" style={{ maxWidth: "32rem" }}>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
