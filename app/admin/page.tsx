"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays, todayIST } from "@/lib/admin/dates";
import { countNewEnquiries, listBookings } from "@/lib/admin/queries";
import type { BookingWithPayments } from "@/lib/admin/types";
import BookingCard from "./_components/BookingCard";
import MonthCalendar from "./_components/MonthCalendar";
import { Notice, PageTitle } from "./_components/ui";

const UPCOMING_DAYS = 30;

const pad = (n: number) => String(n).padStart(2, "0");
const monthStart = (y: number, m: number) => `${y}-${pad(m + 1)}-01`;

export default function AdminHome() {
  const today = todayIST();
  const [ym, setYm] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 });
  const [monthRows, setMonthRows] = useState<BookingWithPayments[] | null>(null);
  const [upcoming, setUpcoming] = useState<BookingWithPayments[] | null>(null);
  const [newEnquiries, setNewEnquiries] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = new Date(Date.UTC(ym.y, ym.m + 1, 1));
    listBookings({ from: monthStart(ym.y, ym.m), to: monthStart(next.getUTCFullYear(), next.getUTCMonth()) })
      .then(setMonthRows)
      .catch((e: Error) => setError(e.message));
  }, [ym]);

  useEffect(() => {
    listBookings({ from: today, to: addDays(today, UPCOMING_DAYS) })
      .then((rows) => setUpcoming(rows.filter((r) => r.status === "confirmed")))
      .catch((e: Error) => setError(e.message));
    countNewEnquiries()
      .then(setNewEnquiries)
      .catch(() => {});
  }, [today]);

  const shift = (delta: number) =>
    setYm(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });

  return (
    <>
      <PageTitle
        action={
          <Link href="/admin/booking/?new=block" className="btn btn-outline">
            Block dates
          </Link>
        }
      >
        Calendar
      </PageTitle>

      {error ? (
        <div className="mb-6">
          <Notice tone="error" title="Couldn't load bookings">
            {error}
          </Notice>
        </div>
      ) : null}

      {newEnquiries > 0 ? (
        <div className="mb-6">
          <Notice tone="info">
            <Link href="/admin/enquiries/" className="link font-semibold">
              {newEnquiries} new website enquir{newEnquiries === 1 ? "y" : "ies"}
            </Link>{" "}
            waiting for a reply.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <MonthCalendar year={ym.y} month={ym.m} bookings={monthRows ?? []} today={today} onShift={shift} />

        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="type-display mb-3" style={{ fontSize: "var(--step-1)" }}>
            Next {UPCOMING_DAYS} days
          </h2>
          {upcoming == null ? (
            <p className="muted">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="muted">Nothing booked or blocked in the next {UPCOMING_DAYS} days.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <BookingCard booking={b} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
