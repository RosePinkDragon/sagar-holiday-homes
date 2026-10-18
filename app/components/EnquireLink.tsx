"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

/** trailingSlash is on, so "/tariff/" must match "/tariff". */
const normalise = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/**
 * A link to a section of a page (`/tariff#enquiry`). From another page it is
 * an ordinary Link, and the router lands on the section. On the page that
 * already holds the section, Next treats a same-URL click as a no-op, so
 * nothing scrolled — this scrolls there itself, smoothly (instantly under
 * prefers-reduced-motion) and moves focus to the section so keyboard and
 * screen-reader users arrive where the page does.
 */
export default function EnquireLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const pathname = normalise(usePathname() ?? "");
  const [path, hash] = href.split("#");

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !hash || normalise(path) !== pathname) return;
    // Leave "open in new tab / window" clicks to the browser.
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modified || event.button !== 0 || props.target === "_blank") return;
    const target = document.getElementById(hash);
    if (!target) return;

    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
    // Keep the router's own history state; replacing it with null breaks back/forward.
    window.history.replaceState(window.history.state, "", `#${hash}`);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
