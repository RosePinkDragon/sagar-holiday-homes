import type { Metadata } from "next";
import Link from "next/link";
import { enquiryHref, pageMetadata, pages } from "@/content/property";
import ForwardTo from "../components/ForwardTo";

/**
 * Contact now lives at the foot of /tariff (one page for "how much" and "how
 * do I book"). Under `output: 'export'` there are no server redirects, so
 * this stays as a small page that forwards visitors from the client
 * (<ForwardTo>; Next's `other` metadata would render a `name="refresh"` tag
 * browsers ignore) and gives a plain link for anyone it doesn't reach. Its
 * canonical points at /tariff so search engines treat the merged page as the
 * real one; robots is left to pageMetadata(), so the pre-launch noindex toggle
 * still governs it.
 */
export function generateMetadata(): Metadata {
  const base = pageMetadata(pages.contact, "pages.contact");
  return {
    ...base,
    alternates: { canonical: `${pages.tariff.route.value}/` },
  };
}

export default function ContactPage() {
  return (
    <main className="section">
      <ForwardTo href={enquiryHref} />
      <div className="shell">
        <h1 className="type-display" style={{ fontSize: "var(--step-2)" }}>
          Contact
        </h1>
        <p className="measure mt-4">
          Contact details and the enquiry form are now on the Tariff &amp;
          booking page.
        </p>
        <p className="mt-6">
          <Link href={enquiryHref} className="btn btn-solid">
            Go to the enquiry form
          </Link>
        </p>
      </div>
    </main>
  );
}
