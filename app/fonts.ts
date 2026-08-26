/**
 * Typefaces for the site. DESIGN.md "Type".
 *
 * Both are variable fonts, self-hosted by next/font at build time — no request
 * reaches Google from the browser, which matters for a static export with no
 * server in front of it.
 *
 * `wght` is deliberately NOT driven through `font-variation-settings` anywhere
 * in the stylesheet. Doing so overrides `font-weight` and silently breaks every
 * weight utility. Weight stays a normal `font-weight`; only SOFT / WONK / opsz
 * go through variation settings. See `.type-display` in globals.css.
 */
import { Fraunces, Karla } from "next/font/google";

/**
 * Display. Headings only, never body copy.
 *
 * Axes requested beyond the default `wght`, per DESIGN.md: SOFT (0–100) softens
 * the terminals, WONK (0–1) unlocks the wonky alternates, opsz (9–144) is the
 * optical size. Verified against next's own font-data manifest.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Body. Humanist grotesque, chosen to hold up on mid-range Android screens. */
export const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-karla",
  fallback: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
});

/** Both variable-name classes, for the <html> element in the root layout. */
export const fontVariables = `${fraunces.variable} ${karla.variable}`;
