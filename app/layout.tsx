import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { identity, lodgingBusinessJsonLd, resolved, seo } from "@/content/property";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Site-wide metadata defaults, sourced from the content module rather than
 * typed here — no facts in components (CLAUDE.md rule 1). Every page's own
 * generateMetadata sets title/description/openGraph.{title,description};
 * what lives here — metadataBase, the OG image, siteName, locale — is what
 * every page should inherit unless it says otherwise.
 */
const ogImage = resolved(seo.defaultOgImage);

export const metadata: Metadata = {
  metadataBase: new URL(`https://${identity.domain}`),
  title: identity.name,
  description: identity.positioning,
  openGraph: {
    siteName: identity.name,
    type: "website",
    locale: "en_IN",
    images: ogImage
      ? [{ url: ogImage, width: 1200, height: 630, alt: identity.name }]
      : [],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = lodgingBusinessJsonLd();

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Static JSON built from content/property.ts — no user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
