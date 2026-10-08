"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Eases page content in as it scrolls into view. Mounted once in the layout
 * and applied by selector, so every page gets it without per-page wiring.
 *
 * Safety properties, on purpose:
 *  - Only elements that start BELOW the fold are hidden. Anything already on
 *    screen is left alone, so there is no flash of hidden above-the-fold copy.
 *  - Nothing is hidden until this effect runs, so with JS off the page is
 *    simply visible. Under prefers-reduced-motion it does nothing at all.
 *  - Once an element has revealed, the data attribute is removed, so the
 *    reveal's transition/delay can't leak into later hover transitions.
 *
 * Targets are the direct children of each section's `.shell`. Where a child is
 * a grid or list, its items are staggered individually instead.
 */
const MAX_STAGGER = 5;

function collectTargets(root: ParentNode): HTMLElement[] {
  const targets: HTMLElement[] = [];
  root.querySelectorAll<HTMLElement>("main section > .shell > *").forEach((el) => {
    const isGroup =
      ["UL", "OL", "DL"].includes(el.tagName) || el.classList.contains("grid");
    if (isGroup && el.children.length > 1) {
      (Array.from(el.children) as HTMLElement[]).forEach((child, i) => {
        child.style.setProperty("--i", String(Math.min(i, MAX_STAGGER)));
        targets.push(child);
      });
    } else {
      targets.push(el);
    }
  });
  return targets;
}

export default function ScrollReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const fold = window.innerHeight;
    const pending = collectTargets(document).filter(
      (el) => el.getBoundingClientRect().top > fold * 0.92
    );
    pending.forEach((el) => el.setAttribute("data-reveal", "out"));

    const timers: number[] = [];
    const reveal = (el: HTMLElement) => {
      io.unobserve(el);
      el.setAttribute("data-reveal", "in");
      timers.push(
        window.setTimeout(() => el.removeAttribute("data-reveal"), 1000)
      );
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    pending.forEach((el) => io.observe(el));

    // An observer only fires when an element crosses the threshold, so one the
    // visitor jumps clean over (anchor link, restored scroll, fast fling) would
    // stay invisible above the viewport. Sweep for those on scroll.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      pending.forEach((el) => {
        if (
          el.getAttribute("data-reveal") === "out" &&
          el.getBoundingClientRect().bottom < 0
        ) {
          reveal(el);
        }
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      io.disconnect();
      timers.forEach(clearTimeout);
      // Restore anything still hidden, so a route change never strands content.
      pending.forEach((el) => el.removeAttribute("data-reveal"));
    };
  }, [pathname]);

  return null;
}
