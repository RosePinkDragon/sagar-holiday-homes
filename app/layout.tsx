import type { Metadata } from "next";
import { identity } from "@/content/property";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Placeholder site metadata, sourced from the content module rather than typed
 * here — no facts in components. The real SEO layer (per-page generateMetadata,
 * OpenGraph images, JSON-LD) is build step 8.
 */
export const metadata: Metadata = {
  title: identity.name,
  description: identity.positioning,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
