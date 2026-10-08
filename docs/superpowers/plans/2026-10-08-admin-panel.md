# Admin Panel Implementation Plan

> Executed inline in the authoring session (owner: "do as you like"). Code
> lives in the commits; this plan lists tasks, files and verification.

**Goal:** Private `/admin` for bookings, payments, blocks and enquiries, backed by Supabase.

**Architecture:** Static-export Next.js pages; browser-only `supabase-js`; security in Postgres RLS with an email allowlist; one `bookings` table with a gist exclusion constraint as the double-booking guard. Spec: `docs/superpowers/specs/2026-10-08-admin-panel-design.md`.

**Tech stack:** Next 16 App Router, React 19, Tailwind v4 + site tokens, `@supabase/supabase-js` v2, Vitest.

---

### Task 1: Tooling
- Add deps: `@supabase/supabase-js`; dev: `vitest`.
- `package.json` script `"test": "vitest run"`.
- `.env.example` with `NEXT_PUBLIC_SUPABASE_URL=` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=`.
- Verify: `pnpm install`, `pnpm test` (no tests → passes with `--passWithNoTests`).
- Commit.

### Task 2: Schema
- Create `supabase/schema.sql`: tables `admin_emails`, `enquiries`, `bookings`, `payments`; `is_admin()`; `updated_at` trigger; exclusion constraint; RLS policies per spec; seed block for two emails.
- Verify: read-through against spec (no local Postgres available). Owner runs it.
- Commit.

### Task 3: Pure logic (TDD)
- `lib/admin/types.ts` — row types, enums, labels.
- `lib/admin/dates.ts` — `nightsBetween`, `rangesOverlap` (half-open), `monthGrid(year, month)` (Mon-first weeks), `todayIST()`, `occupiedDates(bookings)` → map ISO date → booking.
- `lib/admin/money.ts` — `amountPaid`, `balanceDue`.
- Tests first in `lib/admin/dates.test.ts`, `lib/admin/money.test.ts`; run red, implement, run green.
- Commit.

### Task 4: Supabase client + data access
- `lib/supabase.ts` — singleton browser client or `null` when env missing.
- `lib/admin/queries.ts` — list/get/create/update bookings, add/delete payment, list/update enquiries, `friendlyError()` (maps `23P01` → overlap message).
- Commit.

### Task 5: Site chrome + SEO isolation
- `app/components/SiteChrome.tsx` (client) hides children on `/admin*`; wrap Header/Footer in `app/layout.tsx`.
- `next-sitemap.config.js` — exclude `/admin*`, disallow `/admin/` always.
- Commit.

### Task 6: Admin shell + auth
- `app/admin/layout.tsx` — noindex metadata, admin styles.
- `app/admin/_components/AdminGate.tsx`, `AdminNav.tsx`, `NotConfigured.tsx`.
- `app/admin/login/page.tsx`.
- Commit.

### Task 7: Screens
- `MonthCalendar.tsx`, `BookingCard.tsx`, `BookingForm.tsx`, `PaymentList.tsx`.
- Pages: `/admin`, `/admin/bookings`, `/admin/booking` (Suspense + `useSearchParams`), `/admin/enquiries`.
- Commit.

### Task 8: Enquiry form → Supabase
- `lib/enquiries.ts` `saveEnquiry(data)`; `EnquiryForm.onSubmit` runs Supabase insert and Web3Forms in parallel, success if either succeeds.
- Commit.

### Task 9: Verify
- `pnpm test`, `pnpm lint`, `pnpm build` (confirm `out/admin/**` exists, sitemap excludes admin, robots disallows).
- Browser: `/admin/login` unconfigured + configured-placeholder states at 360/768/1024/1280/1440; public header still renders on `/`.
- Commit any fixes.
