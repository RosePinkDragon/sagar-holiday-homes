# Sagar Holiday Homes — design direction

Read alongside `CLAUDE.md` and `BRIEF.md`. This file governs every visual decision. Where it and a personal preference disagree, this file wins.

**Direction:** Orchard & bone.
**Feeling:** a warm family house in a Konkan orchard — not a boutique resort, not a luxury rental.

---

## The thesis

Every villa site in Dapoli leads with a pool photo. We lead with **the ground** — 150 metres of open space, uncropped, horizon running edge to edge. It's the one thing no competitor can show, and it says "bring everyone" before a single word is read.

The pool is the second beat, not the first.

## Materials

The palette comes from the property, not from a hospitality template. Coconut canopy leads. Laterite — the rust-red local building stone you see in every old wall from Dapoli to Ganpatipule — is the accent, not the theme. Bone is sun-bleached plaster.

| Token            | Hex       | Role                                                                                |
| ---------------- | --------- | ----------------------------------------------------------------------------------- |
| `--canopy`       | `#234F3E` | **Primary.** Headings, nav, CTAs, footer ground.                                    |
| `--canopy-deep`  | `#16362A` | Hover, heavy weight, footer.                                                        |
| `--canopy-soft`  | `#5C7F6E` | Dividers, hairlines, rules, placeholder borders. **Not for text.**                  |
| `--canopy-muted` | `#4A6658` | Captions, labels, short metadata. Never a paragraph. Clears 4.5:1.                  |
| `--laterite`     | `#8A3F2B` | **Accent.** Links, underlines, small marks. Never a section background.             |
| `--alphonso`     | `#E8A33D` | Sparing. Mango season, focus rings, highlights. **Not for text.**                   |
| `--pool`         | `#2E7C8F` | Tertiary fills. Pool sections only. Never a general link colour. **Not for text.**  |
| `--pool-deep`    | `#276878` | Text inside pool sections. `--pool` darkened until it clears 4.5:1.                 |
| `--bone`         | `#F0EADF` | Page ground.                                                                        |
| `--bone-deep`    | `#E3DACB` | Alternating sections, raised cards.                                                 |
| `--ink`          | `#2A241C` | **All running copy.** Every paragraph on the site. A warm near-black, never `#000`. |

**Green leads.** If the page reads as a red site with green trim, the balance has inverted and it's wrong. Laterite should appear in small quantities — a link underline, a rule, a mark — and never as a filled block bigger than a button.

**But green is not body copy.** Headings are `--canopy`; every paragraph of running text is `--ink`. Green reads warm in a heading and formal in a paragraph, and a page of green prose is tiring before it is anything else. `--canopy-muted` exists for captions, labels and short metadata — a hex, a unit, a one-line role — never for a paragraph. Where secondary copy needs to recede, make it smaller, not greener.

### What is allowed for text

A colour may carry body text only if it clears **4.5:1 on `--bone-deep`** — the darker of the two grounds, and therefore the harder one. Check this table. Do not eyeball it, and do not reason from "it looks dark enough".

Measured with the WCAG 2.1 relative-luminance formula. Ratios below 4.5 are a fail for body copy even where they pass for large text, because this site sets almost nothing at large sizes outside headings.

| Token            | Hex       | on `--bone` | on `--bone-deep` | Verdict                |
| ---------------- | --------- | ----------- | ---------------- | ---------------------- |
| `--ink`          | `#2A241C` | 12.83       | 11.08            | text OK                |
| `--canopy-deep`  | `#16362A` | 11.00       | 9.50             | text OK                |
| `--canopy`       | `#234F3E` | 7.76        | 6.71             | text OK                |
| `--laterite`     | `#8A3F2B` | 6.21        | 5.36             | text OK                |
| `--canopy-muted` | `#4A6658` | 5.26        | 4.55             | text OK                |
| `--pool-deep`    | `#276878` | 5.26        | 4.54             | text OK                |
| `--pool`         | `#2E7C8F` | 3.99        | 3.45             | **large text only**    |
| `--canopy-soft`  | `#5C7F6E` | 3.72        | 3.21             | **large text only**    |
| `--alphonso`     | `#E8A33D` | 1.80        | 1.56             | **not for text, ever** |

On the dark grounds, the only text colours that pass are `--bone` (7.76 on `--canopy`, 11.00 on `--canopy-deep`) and `--bone-deep` (6.71 / 9.50). `--alphonso` reaches 6.10 on `--canopy-deep` but only 4.31 on `--canopy` — keep it a focus ring, not a word.

`--canopy-soft` and `--pool` are kept at their stated hexes because their real job is hairlines and fills, where contrast minimums do not apply. When you need those hues *as text*, reach for `--canopy-muted` and `--pool-deep`.

## Type

- **Display: Fraunces** (variable). Set `wght` 500–700, `SOFT` 40, `WONK` 1 at large sizes. It has warmth and a little wobble — that's the point. Restraint: headings only, never body copy.
- **Body: Karla.** Humanist grotesque, slightly quirky, highly legible on cheap Android screens.
- Both via `next/font/google`, self-hosted, `display: 'swap'`.
- **If Marathi is added later:** Noto Serif Devanagari for display, Mukta for body. Leave line-height headroom now.

Scale — fluid, `clamp()`, mobile-first:

```
--step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem)
--step-0:  clamp(1rem, 0.95rem + 0.25vw, 1.125rem)
--step-1:  clamp(1.35rem, 1.2rem + 0.7vw, 1.75rem)
--step-2:  clamp(1.8rem, 1.5rem + 1.4vw, 2.75rem)
--step-3:  clamp(2.4rem, 1.9rem + 2.4vw, 4.25rem)
```

Body copy maxes at ~68 characters. Headings sit tight (`line-height: 1.05`), body loose (`1.6`).

## The signature: a continuous horizon

Every page opens with a wide landscape band, and **the horizon sits at the same height on all eight pages** — 62% down the band. Moving between pages feels like walking the property rather than clicking through a brochure.

Ratios: **16:9 below 768px, 21:9 at and above it.** Note that `aspect-ratio` is width/height, so a smaller ratio makes the band *deeper* — 4:3 on a 360px phone is 270px tall against 16:9's 203px. The band must stay under roughly a third of the first screen, otherwise the page title drops below the fold and the rule below breaks.

Rules: full-bleed, never letterboxed with rounded corners, never overlaid with a scrim heavy enough to grey the sky. Page titles sit _below_ the band, on bone, not floated over the image — which only works if the title is actually visible without scrolling. Cheap to build, impossible to mistake for a template.

## Layout

- One column on mobile. Two at `≥768px`, never more.
- Generous vertical rhythm: sections breathe at `clamp(4rem, 10vw, 8rem)`.
- `border-radius: 2px` — almost square. This is cut stone and plaster, not a rounded app card.
- Borders over shadows. A 1px `--canopy` hairline at 20% opacity beats a drop shadow every time.
- Alternate `--bone` and `--bone-deep` between sections. Never a white section.
- Content max-width `1180px`.

## Motion

Almost none. One orchestrated page-load: horizon band fades and settles by 4px over 600ms, then the heading. Nothing else animates on load.

Hover: 150ms colour only. No lifts, no scales, no parallax. Respect `prefers-reduced-motion` — when set, everything is instant.

## Photography

Photos don't exist yet. Placeholders are `--bone-deep` with a 1px `--canopy-soft` hairline border and a centred caption in `--canopy-muted` naming the shot required (e.g. "HERO — pool with orchard behind, golden hour"). The border is `--canopy-soft`; the caption is `--canopy-muted`, because the caption is text — see [What is allowed for text](#what-is-allowed-for-text). Correct aspect ratios from day one so nothing reflows when real images land.

When they arrive: warm, unfiltered, no HDR, no heavy vignettes. A house that looks lived in, not staged.

## Voice

Plain and specific. Concrete beats adjective — "a 150m ground for cricket" is stronger than "sprawling premium lawns."

Never: _nestled, tranquil oasis, luxurious, unwind, escape the hustle, bespoke, curated, elevate._

Buttons say what happens: "Send enquiry," then a confirmation that says "Enquiry sent." Errors explain the fix, don't apologise.

## Do not build the default AI villa site

The pattern to avoid, because it's the strongest pull: cream background near `#F4F1EA`, high-contrast serif display, terracotta accent near `#D97757`, rounded cards, three-column icon grid of amenities, gradient CTA.

Bone sits close to that cream, so the differentiation has to be carried elsewhere, deliberately. Four things hold this direction apart:

1. **Green is primary, red is a minor accent** — the default is red-led
2. **Square corners** — 2px, not 12px
3. **Full-bleed horizon hero** — not a rounded card with text floated over it
4. **Amenities as a typographic list** — not a three-column icon grid

If any one of those slips, the whole thing collapses into the template. Check all four before calling a page done.

Also banned: stock icons for amenities (write the words), pill-shaped badges, glassmorphism, animated counters, autoplaying testimonial carousels.

## Quality floor

Non-negotiable, and not worth announcing in the UI:

- Works at 360px wide
- Visible keyboard focus — 2px `--alphonso` outline, 2px offset
- Text contrast ≥ 4.5:1, measured against `--bone-deep`. Which colours qualify is settled in [What is allowed for text](#what-is-allowed-for-text) — that table is the single source of truth, so add a colour there before using it for type. `--alphonso`, `--canopy-soft` and `--pool` all fail and are never text.
- Tap targets ≥ 44px
- Semantic landmarks, one `h1` per page
- Renders usably with images blocked

## Build order for the visual layer

1. `app/globals.css` — all tokens as custom properties, plus the type scale
2. `next/font` setup for Fraunces and Karla
3. **`/styleguide`** — a throwaway route showing every swatch, the full type scale, buttons, links, focus states, and the horizon band placeholder

Review the styleguide on a phone before building anything else. Two failure modes to check for: has laterite crept back into a leading role, and does the type read as a family house rather than a boutique hotel. Both are cheap to fix here and expensive across eight built pages.

Delete `/styleguide` before launch, or exclude it from the sitemap and add `noindex`.
