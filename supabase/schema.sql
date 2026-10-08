-- Sagar Holiday Homes — admin panel schema
--
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: tables use IF NOT EXISTS and policies are dropped first.
--
-- BEFORE RUNNING: edit the two emails in the last section to the owner's and
-- caretaker's login emails. Only emails in admin_emails can see any data.
--
-- Spec: docs/superpowers/specs/2026-10-08-admin-panel-design.md

-- ---------------------------------------------------------------------------
-- Allowlist
-- ---------------------------------------------------------------------------

create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);

-- SECURITY DEFINER so it can read admin_emails without tripping that table's
-- own RLS (which itself calls is_admin()).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Enquiries — written by the public website form, read by admins
-- ---------------------------------------------------------------------------

create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 200),
  phone      text not null check (char_length(phone) between 3 and 40),
  email      text check (email is null or char_length(email) <= 200),
  check_in   date,
  check_out  date,
  -- Deliberately looser than the villa's max occupancy: an enquiry for too
  -- many people should still land so someone can reply to it.
  guests     int check (guests is null or guests between 1 and 100),
  meals      text check (meals is null or char_length(meals) <= 40),
  message    text check (message is null or char_length(message) <= 4000),
  status     text not null default 'new'
             check (status in ('new', 'contacted', 'converted', 'closed'))
);

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- Bookings and blocks — one table so one constraint guards both
-- ---------------------------------------------------------------------------

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'booking' check (kind in ('booking', 'block')),
  status       text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  check_in     date not null,
  -- Exclusive: the check-out day is free for the next guest's check-in.
  check_out    date not null,
  guest_name   text check (guest_name is null or char_length(guest_name) <= 200),
  phone        text check (phone is null or char_length(phone) <= 40),
  email        text check (email is null or char_length(email) <= 200),
  guests       int,
  source       text check (source is null or source in ('direct', 'airbnb', 'booking_com', 'other')),
  -- Agreed amount in rupees, as entered. Not computed from the tariff: the
  -- GST-inclusive/exclusive decision is still open (CLAUDE.md rule 7).
  total_amount numeric(10, 2) check (total_amount is null or total_amount >= 0),
  notes        text check (notes is null or char_length(notes) <= 4000),
  enquiry_id   uuid references public.enquiries (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint bookings_dates_order check (check_out > check_in),

  -- Max occupancy is 12 (BRIEF §2, CLAUDE.md rule 4).
  constraint bookings_guest_fields check (
    kind = 'block'
    or (
      guest_name is not null
      and char_length(guest_name) > 0
      and guests between 1 and 12
      and source is not null
    )
  ),

  -- THE double-booking guard. Any two confirmed rows (bookings or blocks)
  -- whose [check_in, check_out) ranges overlap are rejected with SQLSTATE
  -- 23P01. Back-to-back stays are allowed; cancelled rows never block.
  constraint bookings_no_overlap exclude using gist (
    daterange(check_in, check_out, '[)') with &&
  ) where (status = 'confirmed')
);

create index if not exists bookings_check_in_idx on public.bookings (check_in);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Payments received against a booking
-- ---------------------------------------------------------------------------

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  amount     numeric(10, 2) not null check (amount > 0),
  paid_on    date not null default current_date,
  method     text not null check (method in ('upi', 'bank', 'cash', 'ota_payout', 'other')),
  note       text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on public.payments (booking_id);

-- ---------------------------------------------------------------------------
-- Grants — explicit, so nothing depends on Supabase's default privileges
-- ---------------------------------------------------------------------------

revoke all on public.admin_emails, public.bookings, public.payments, public.enquiries from anon;
grant insert on public.enquiries to anon;

grant select, insert, update, delete
  on public.admin_emails, public.bookings, public.payments, public.enquiries
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admin_emails enable row level security;
alter table public.enquiries    enable row level security;
alter table public.bookings     enable row level security;
alter table public.payments     enable row level security;

drop policy if exists "admins manage admin_emails" on public.admin_emails;
create policy "admins manage admin_emails" on public.admin_emails
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage bookings" on public.bookings;
create policy "admins manage bookings" on public.bookings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage payments" on public.payments;
create policy "admins manage payments" on public.payments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Anyone (the public website) can submit an enquiry, but only as 'new'.
drop policy if exists "public can submit enquiries" on public.enquiries;
create policy "public can submit enquiries" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "admins read enquiries" on public.enquiries;
create policy "admins read enquiries" on public.enquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admins update enquiries" on public.enquiries;
create policy "admins update enquiries" on public.enquiries
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete enquiries" on public.enquiries;
create policy "admins delete enquiries" on public.enquiries
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Who can log in — EDIT THESE before running (lowercase)
-- ---------------------------------------------------------------------------

insert into public.admin_emails (email) values
  ('owner-email@example.com'),
  ('caretaker-email@example.com')
on conflict do nothing;
