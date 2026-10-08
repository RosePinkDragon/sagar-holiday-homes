import type { Metadata } from "next";
import { identity } from "@/content/property";
import AdminShell from "./_components/AdminShell";

/**
 * Private booking panel (docs/superpowers/specs/2026-10-08-admin-panel-design.md).
 * Static shells only — every page is a client component that talks to
 * Supabase from the browser. Never indexed, never in the sitemap.
 */
export const metadata: Metadata = {
  title: `Admin — ${identity.name}`,
  description: "Private booking panel.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
