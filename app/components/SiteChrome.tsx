"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides the public header/footer inside /admin, which has its own shell.
 * Under static export the pathname is known at prerender, so each page's HTML
 * already has (or lacks) the chrome — no flash on load.
 *
 * A `(site)` route group with its own root layout would be the structural
 * fix, but it moves every public page file; this keeps the admin change small.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : children;
}
