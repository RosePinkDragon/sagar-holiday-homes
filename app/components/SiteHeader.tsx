"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Scrolled this far (px) and the bar shrinks; back above EXPAND_BEFORE it grows again. */
const COMPACT_AFTER = 64;
const EXPAND_BEFORE = 16;

/**
 * The header is `position: fixed` with a same-height spacer in the flow
 * (`.header-spacer`), so shrinking it after a scroll never moves the page
 * content underneath. The two thresholds differ on purpose: a single one
 * would flicker as the bar changes height around it.
 *
 * Everything inside is rendered by the server Header and passed in as
 * `children`; this component only owns the scrolled state.
 */
export default function SiteHeader({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setCompact((was) => (was ? y > EXPAND_BEFORE : y > COMPACT_AFTER));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update(); // a reload or #anchor can land mid-page
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header className="site-header" data-compact={compact}>
        {children}
      </header>
      <div className="header-spacer" aria-hidden="true" />
    </>
  );
}
