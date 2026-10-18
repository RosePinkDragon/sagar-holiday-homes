"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Sends the visitor on as soon as the page loads. A static export can't do
 * server redirects, and Next's `other` metadata renders `<meta name="refresh">`
 * (browsers only honour `http-equiv`), so the page forwards from the client.
 * Renders nothing — callers keep a visible link for anyone it doesn't reach.
 */
export default function ForwardTo({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [router, href]);
  return null;
}
