import type { Metadata } from "next";
import Link from "next/link";
import {
  contact,
  faq,
  faqJsonLd,
  formatPhone,
  pageMetadata,
  pages,
  resolved,
} from "@/content/property";
import HorizonBand from "../components/HorizonBand";

/**
 * New route (audit §5.1) — every answer is sourced from content/property.ts,
 * never typed here (CLAUDE.md rule 1). Questions the module has no
 * confirmed answer for (couples/mixed groups, pets, alcohol, payment
 * method, bringing an outside cook) are deliberately absent — see the
 * comment above `faq` in content/property.ts.
 */

export function generateMetadata(): Metadata {
  return pageMetadata(pages.faq, "pages.faq");
}

export default function FaqPage() {
  const jsonLd = faqJsonLd();
  const phone = resolved(contact.phone);

  return (
    <main>
      {/* FAQPage schema, scoped to this page only. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HorizonBand caption="VILLA — front of the house, daytime" />

      <header className="shell settle-next" style={{ paddingBlock: "3rem" }}>
        <h1
          className="type-display type-display-lg mt-3"
          style={{ fontSize: "var(--step-3)" }}
        >
          Straight answers
        </h1>
        <p className="measure mt-6">
          The questions that come up most before booking. Anything not
          covered here —{" "}
          {phone ? (
            <a href={`tel:${phone}`} className="link">
              call {formatPhone(phone)}
            </a>
          ) : (
            <Link href="/contact" className="link">
              get in touch
            </Link>
          )}
          .
        </p>
      </header>

      <section className="section bg-bone-deep">
        <div className="shell">
          <div className="grid gap-8">
            {faq.map((item) => (
              <div key={item.question} className="hairline p-6">
                <h2
                  className="type-display"
                  style={{ fontSize: "var(--step-1)" }}
                >
                  {item.question}
                </h2>
                <p className="measure mt-3">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
