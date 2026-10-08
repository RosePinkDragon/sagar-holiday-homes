import Link from "next/link";
import { bookingOn, formatMonth, monthGrid, type ISODate } from "@/lib/admin/dates";
import type { Booking } from "@/lib/admin/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Night-based month view: a cell is shaded when someone sleeps there that
 * night, so a check-out day shows free (it's bookable for the next guest).
 * Booked/blocked nights link to the booking; free future nights link to a
 * new booking starting that day.
 */
export default function MonthCalendar({
  year,
  month,
  bookings,
  today,
  onShift,
}: {
  year: number;
  month: number;
  bookings: readonly Booking[];
  today: ISODate;
  onShift: (delta: number) => void;
}) {
  const weeks = monthGrid(year, month);

  return (
    <section aria-label={`Calendar, ${formatMonth(year, month)}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" className="btn btn-outline" onClick={() => onShift(-1)} aria-label="Previous month">
          ←
        </button>
        <h2 className="type-display text-center" style={{ fontSize: "var(--step-1)" }}>
          {formatMonth(year, month)}
        </h2>
        <button type="button" className="btn btn-outline" onClick={() => onShift(1)} aria-label="Next month">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} aria-hidden="true" className="label text-center py-1">
            {d.slice(0, 1)}
            <span className="hidden sm:inline">{d.slice(1)}</span>
          </div>
        ))}
        {weeks.flat().map((iso, i) =>
          iso ? <DayCell key={iso} iso={iso} bookings={bookings} today={today} /> : <div key={`pad-${i}`} />
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-fine muted">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3" style={{ background: "var(--canopy)" }} /> Booked
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3" style={blockStyle} /> Blocked
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3" style={{ outline: "2px solid var(--alphonso)" }} /> Today
        </li>
      </ul>
    </section>
  );
}

const blockStyle = {
  background:
    "repeating-linear-gradient(135deg, var(--bone-deep) 0 6px, color-mix(in srgb, var(--laterite) 35%, var(--bone-deep)) 6px 8px)",
};

function DayCell({ iso, bookings, today }: { iso: ISODate; bookings: readonly Booking[]; today: ISODate }) {
  const day = Number(iso.slice(8));
  const stay = bookingOn(bookings, iso);
  const isToday = iso === today;
  const base = "flex min-h-12 flex-col items-start p-1 text-left sm:min-h-16 sm:p-1.5";
  const ring = isToday ? { outline: "2px solid var(--alphonso)", outlineOffset: -2 } : {};

  if (stay) {
    const isBlock = stay.kind === "block";
    const starts = stay.check_in === iso;
    const label = isBlock ? stay.notes || "Blocked" : stay.guest_name;
    return (
      <Link
        href={`/admin/booking/?id=${stay.id}`}
        className={base}
        style={{
          ...(isBlock ? blockStyle : { background: "var(--canopy)", color: "var(--bone)" }),
          ...ring,
        }}
        aria-label={`${iso}: ${isBlock ? "blocked" : "booked"}${label ? `, ${label}` : ""}`}
      >
        <span className="text-fine font-semibold">{day}</span>
        {starts && label ? (
          <span className="mt-auto hidden w-full truncate text-[0.7rem] leading-tight sm:block">{label}</span>
        ) : null}
      </Link>
    );
  }

  if (iso >= today) {
    return (
      <Link
        href={`/admin/booking/?new=booking&date=${iso}`}
        className={`${base} hairline hover:bg-bone-deep`}
        style={ring}
        aria-label={`${iso}: free — add booking`}
      >
        <span className="text-fine">{day}</span>
      </Link>
    );
  }

  return (
    <div className={`${base} muted`} style={{ opacity: 0.5 }} aria-label={`${iso}: past`}>
      <span className="text-fine">{day}</span>
    </div>
  );
}
