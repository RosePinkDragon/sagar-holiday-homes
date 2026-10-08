"use client";

import { useEffect, useMemo, useState } from "react";
import { todayIST } from "@/lib/admin/dates";
import { listBookings } from "@/lib/admin/queries";
import type { BookingWithPayments } from "@/lib/admin/types";
import BookingCard from "../_components/BookingCard";
import { Notice, PageTitle, Tabs } from "../_components/ui";

type View = "upcoming" | "past" | "cancelled";

/**
 * Every booking and block. Volume is a handful a month, so one fetch and
 * client-side filtering is simpler than paging.
 */
export default function BookingsPage() {
  const today = todayIST();
  const [rows, setRows] = useState<BookingWithPayments[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("upcoming");

  useEffect(() => {
    listBookings()
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);

  const groups = useMemo(() => {
    const all = rows ?? [];
    const confirmed = all.filter((r) => r.status === "confirmed");
    return {
      upcoming: confirmed.filter((r) => r.check_out > today),
      // Most recent first for history.
      past: confirmed.filter((r) => r.check_out <= today).reverse(),
      cancelled: all.filter((r) => r.status === "cancelled").reverse(),
    };
  }, [rows, today]);

  const shown = groups[view];

  return (
    <>
      <PageTitle>Bookings</PageTitle>
      <Tabs
        label="Filter bookings"
        value={view}
        onChange={setView}
        options={[
          { value: "upcoming", label: "Upcoming", count: groups.upcoming.length },
          { value: "past", label: "Past", count: groups.past.length },
          { value: "cancelled", label: "Cancelled", count: groups.cancelled.length },
        ]}
      />
      {error ? (
        <Notice tone="error" title="Couldn't load bookings">
          {error}
        </Notice>
      ) : rows == null ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="muted">Nothing here.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((b) => (
            <li key={b.id}>
              <BookingCard booking={b} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
