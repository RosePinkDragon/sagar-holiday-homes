# Admin panel — design

Date: 2026-10-08 · Branch: `feat/admin-panel`

## Goal

A private `/admin` area where the owner and caretaker can see and manage
bookings, payments, blocked dates and website enquiries — replacing the
shared Google Calendar from BRIEF §7 as the single source of truth for
availability.

## Brief conflicts (flagged, owner accepted)

- BRIEF §12 lists only the website, GBP and OTA setup as in scope. The admin
  panel is additional work the owner asked for on 2026-10-08.
- BRIEF §7 says a later admin panel should integrate with the channel
  manager's API. v1 has no OTA integration: Airbnb/Booking.com bookings are
  entered by hand. When a channel manager arrives, its API feeds the same
  `bookings` table.

## Decisions

| Question | Decision |
|---|---|
| Data source | Manual entry + website enquiries saved automatically |
| Users | Owner + caretaker, identical access |
| v1 features | Bookings list, month calendar, payment tracking, blocked dates, database-level double-booking guard |
| Not in v1 | OTA/iCal sync, public availability calendar, roles, online payment, email notifications from Supabase |
| Where it lives | `/admin` inside this Next.js app, client-only (static export stays intact) |

## Architecture

- `output: 'export'` is unchanged. Admin pages are static shells; all data
  is fetched in the browser with `@supabase/supabase-js` using the public
  anon/publishable key.
- Security lives in Postgres Row Level Security, not in the frontend. The
  anon key is public by design.
- Auth: **email + password**. Users are created by the owner in the Supabase
  dashboard; public sign-ups are disabled. (Magic links were rejected:
  Supabase's built-in mailer is rate-limited and only delivers to project team
  members, and links opened from Gmail's in-app browser lose the session.)
- Allowlist: an `admin_emails` table. Every admin policy checks
  `is_admin()` — the JWT email is in that table — so an accidental sign-up
  toggle cannot expose data.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (either the
  legacy anon key or the newer `sb_publishable_…` key). If unset, the admin
  shows a "Supabase not configured" notice and the enquiry form skips the
  Supabase insert.

### Layout / chrome

The root layout renders the public Header, Footer and JSON-LD. Moving every
public page into a `(site)` route group would give `/admin` its own root
layout, but it would touch every page file while another branch is editing
them. Instead a small client component `SiteChrome` hides Header/Footer when
`usePathname()` starts with `/admin`. Under static export the pathname is
known at prerender, so the HTML is correct with no flash. Route-group split
can come later.

### SEO isolation

- `app/admin/layout.tsx` sets `robots: { index: false, follow: false }`.
- `next-sitemap.config.js` excludes `/admin*` and adds `Disallow: /admin/`
  to robots.txt in both pre-launch and live modes.

## Data model (Postgres, `public` schema)

`bookings` — one row per stay **or** block (one table so a single exclusion
constraint covers both):

| column | type | notes |
|---|---|---|
| id | uuid pk | `gen_random_uuid()` |
| kind | text | `'booking'` or `'block'` |
| status | text | `'confirmed'` or `'cancelled'` |
| check_in | date | |
| check_out | date | exclusive (checkout day is free for the next guest); `check_out > check_in` |
| guest_name | text | required when `kind='booking'` |
| phone, email | text | optional |
| guests | int | 1–12 when kind='booking' (BRIEF max occupancy) |
| source | text | `'direct' \| 'airbnb' \| 'booking_com' \| 'other'` |
| total_amount | numeric(10,2) | agreed amount in ₹, as entered — not computed from the tariff (GST treatment still open, CLAUDE.md rule 7) |
| notes / block reason | text | |
| enquiry_id | uuid fk → enquiries | nullable |
| created_at, updated_at | timestamptz | trigger maintains `updated_at` |

**Double-booking guard:**
`EXCLUDE USING gist (daterange(check_in, check_out, '[)') WITH &&) WHERE (status = 'confirmed')`.
Back-to-back stays (one checks out the day another checks in) are allowed.
Cancelled rows never block. The UI translates the Postgres error
(`23P01`) into "These dates overlap an existing booking or block."

`payments`: id, booking_id (fk, cascade), amount > 0, paid_on date,
method (`'upi' | 'bank' | 'cash' | 'ota_payout' | 'other'`), note, created_at.
Balance due = `total_amount − sum(payments)`, computed in the client.

`enquiries`: id, created_at, name, phone, email, check_in, check_out,
guests, meals, message (length-limited by check constraints), status
(`'new' | 'contacted' | 'converted' | 'closed'`).

`admin_emails`: email (pk). Seeded by the owner in the setup SQL.

### RLS

- `bookings`, `payments`, `admin_emails`: all operations for `is_admin()`
  only.
- `enquiries`: `insert` for `anon` and `authenticated` with column checks
  (status must be `'new'`); `select/update/delete` for `is_admin()` only.
  Anonymous visitors can submit but never read.

Schema ships as `supabase/schema.sql` — one idempotent-enough script the
owner pastes into the SQL Editor once.

## Screens (mobile-first, reuse site tokens from `globals.css`)

| Route | Purpose |
|---|---|
| `/admin/login/` | Email + password |
| `/admin/` | Month calendar (booked/blocked days shaded, tap → booking) + "Next 30 days" list with balance due + count of new enquiries |
| `/admin/bookings/` | All bookings, tabs: Upcoming / Past / Cancelled |
| `/admin/booking/?id=…` | View/edit one booking or block; payments list + add payment; cancel |
| `/admin/booking/?new=booking` / `?new=block` / `?enquiry=…` | Create; `enquiry` pre-fills from that enquiry and marks it converted on save |
| `/admin/enquiries/` | New/contacted/closed tabs; tap to call/WhatsApp; "Create booking" |

Query-string routes (not `[id]`) because static export cannot prerender
runtime ids. Components using `useSearchParams` sit inside `<Suspense>`.

An `AdminGate` client component wraps all admin pages except login: checks
the session, redirects to login if absent, shows "not on allowlist" if RLS
returns nothing for an authenticated non-admin.

## Code layout

```
app/admin/layout.tsx            metadata (noindex) + admin shell
app/admin/**/page.tsx           thin pages
app/admin/_components/*         AdminGate, AdminNav, BookingForm, PaymentList, MonthCalendar …
lib/supabase.ts                 browser client (null when env missing)
lib/admin/types.ts              row types + enums
lib/admin/dates.ts              pure: nights, overlap, month grid, today in IST
lib/admin/money.ts              pure: balance, totals
lib/admin/queries.ts            thin data-access functions
lib/admin/*.test.ts             vitest for the pure modules
supabase/schema.sql
```

## Enquiry form change

`EnquiryForm.onSubmit` inserts into `enquiries` first (if Supabase is
configured), then posts to Web3Forms as today. The two are independent:
either failing does not block the other; the visitor sees success if
**either** succeeded. Field mapping uses the existing `enquiryForm.fields`
names.

## Error handling

- Network/RLS errors surface inline in plain language, never swallowed.
- Overlap → specific message (above).
- Session expiry → AdminGate redirects to login.

## Testing

- Vitest unit tests for `dates.ts` and `money.ts` (overlap, exclusive
  checkout, month grid, balances).
- `pnpm build` must succeed (static export with admin routes).
- Manual browser check of login screen and unconfigured state; full data flow
  is verified once the owner's Supabase project exists.
- Layout checked at 360, 768, 1024, 1280, 1440px (CLAUDE.md).

## Owner setup steps

1. Create Supabase project (free, Mumbai region).
2. Run `supabase/schema.sql` in the SQL Editor after editing the two
   allowlisted emails at the bottom.
3. Authentication → Providers → Email: disable "Allow new users to sign up".
4. Authentication → Users → Add user (owner, caretaker) with password,
   auto-confirm.
5. Put URL + anon key in `.env.local` and in Vercel env vars.
