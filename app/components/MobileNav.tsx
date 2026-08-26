"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type NavItem = { route: string; label: string };

/**
 * Mobile-only hamburger + right-side drawer. The desktop nav in Header.tsx is
 * a separate, always-visible <nav> — this component renders nothing at
 * 768px+ (every top-level element below carries md:hidden). Between
 * 768-1024px that flat nav wraps onto two rows rather than the hamburger
 * reappearing — see the comment in Header.tsx.
 *
 * The drawer and its backdrop are always mounted; `data-open` drives the
 * slide/fade in globals.css. A conditionally-mounted drawer can't animate an
 * enter transition — it would just appear already in its open position.
 * `inert` while closed keeps the (off-screen but still-present) content out
 * of the tab order and the accessibility tree, which is what makes "focus
 * returns to the button" and "Tab can't leak into the drawer" hold without
 * extra bookkeeping.
 */
export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-outline nav-toggle md:hidden"
        aria-expanded={open}
        aria-controls={drawerId}
        aria-label="Menu"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" size={20} />
      </button>

      <div
        className="nav-drawer-backdrop md:hidden"
        data-open={open}
        aria-hidden="true"
        inert={!open}
        onClick={close}
      />

      <div
        id={drawerId}
        ref={drawerRef}
        className="nav-drawer md:hidden"
        data-open={open}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="btn btn-outline nav-toggle"
          style={{ alignSelf: "flex-end" }}
          aria-label="Close menu"
          onClick={close}
        >
          <X aria-hidden="true" size={20} />
        </button>

        <nav aria-label="Primary" className="nav-drawer-list">
          {items.map(({ route, label }) => (
            <Link
              key={route}
              href={route}
              className="footer-link nav-drawer-link"
              onClick={close}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
