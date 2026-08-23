@AGENTS.md

# Sagar Holiday Homes — project context

Marketing website for a holiday villa in Saldure, Dapoli, Ratnagiri, Maharashtra.
Business requirements live in `BRIEF.md`. **Read the relevant section before building any page.**

## Stack

- Next.js 15, App Router, TypeScript
- `output: 'export'` — static export, no server
- Tailwind CSS
- Deployed to Vercel / Cloudflare Pages

## Hard rules

**1. No facts in components.** Every rate, dimension, distance, amenity, policy line and phone number lives in `content/property.ts`. Components import from it. If a fact is missing, add it to the module and say so — never inline it into JSX.

**2. Never invent property facts.** If it is not in `BRIEF.md` §2 or `content/property.ts`, it does not exist. Do not add plausible amenities (spa, bonfire, BBQ, sea view, lawn) because a villa site usually has them.

**3. It is a 3BHK.** Never 4BHK, regardless of the domain name.

**4. Max occupancy is 12.** Not 16, 17 or 20. 17 is a future state and must not appear on the site.

**5. It is not sea-facing.** The beach is a 5-minute drive. Never imply a sea view or beachfront.

**6. Pool safety copy is verbatim.** The disclosure in `BRIEF.md` §3 is used word for word. Do not soften, shorten or paraphrase it.

**7. No rate appears without its GST treatment.** The inclusive/exclusive decision is still open — until it is resolved, rates render from the content module with a `gstNote` field alongside.

## Static export constraints

No route handlers, server actions, middleware, or ISR. The enquiry form posts to an external endpoint (Web3Forms/Formspree). `next/image` requires `unoptimized: true`; images are pre-optimised to WebP/AVIF before entering `public/`.

## SEO requirements

Non-negotiable on every page:

- Unique `title` and `description` via `generateMetadata`
- OpenGraph image — WhatsApp sharing is the main distribution channel in this market
- Descriptive `alt` on every image
- Explicit image dimensions (avoid layout shift)

Site-wide: `LodgingBusiness` JSON-LD, `sitemap.xml`, `robots.txt`.

Target queries: "villa with private pool in Dapoli", "3BHK villa Dapoli", "villa near Saldure beach", "Dapoli villa for family groups".

**Never copy or closely paraphrase competitor site copy.** All content written fresh.

## Audience and tone

Extended families and friend groups from Mumbai and Pune, mostly on mid-range Android phones. Mobile-first, always.

Tone: warm, plain, specific. Concrete details beat adjectives — "a 150m open ground for cricket" is stronger than "sprawling premium lawns". No luxury-brochure language.

## Build order

1. `content/property.ts`
2. Layout, header, footer, nav
3. Location
4. Villa
5. Pool & Grounds
6. Tariff
7. Food, Gallery, Contact
8. SEO layer
9. Home (last — it summarises the others)

## Working style

- Use plan mode for any multi-file change.
- One page per session where possible. Commit between pages.
- Photos are not available yet. Use placeholder blocks with correct aspect ratios and real alt text.
- Flag any conflict between an instruction and `BRIEF.md` rather than resolving it silently.
