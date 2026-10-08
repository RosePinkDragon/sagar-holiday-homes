import Link from "next/link";
import { formatInr } from "@/content/property";
import { formatDay, nightsBetween } from "@/lib/admin/dates";
import { balanceDue } from "@/lib/admin/money";
import { SOURCE_LABELS, type BookingWithPayments } from "@/lib/admin/types";

export default function BookingCard({ booking }: { booking: BookingWithPayments }) {
  const nights = nightsBetween(booking.check_in, booking.check_out);
  const isBlock = booking.kind === "block";
  const balance = isBlock ? null : balanceDue(booking.total_amount, booking.payments);
  const cancelled = booking.status === "cancelled";

  return (
    <Link
      href={`/admin/booking/?id=${booking.id}`}
      className="hairline block p-4 transition-colors hover:bg-bone-deep"
      style={cancelled ? { opacity: 0.6 } : undefined}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-semibold" style={{ textDecoration: cancelled ? "line-through" : undefined }}>
          {isBlock ? `Blocked${booking.notes ? ` · ${booking.notes}` : ""}` : booking.guest_name}
        </p>
        {cancelled ? (
          <span className="label">Cancelled</span>
        ) : balance != null && balance !== 0 ? (
          <span className="text-fine font-semibold" style={{ color: "var(--laterite)" }}>
            {balance > 0 ? `${formatInr(balance)} due` : `${formatInr(-balance)} to refund`}
          </span>
        ) : balance === 0 ? (
          <span className="label">Paid</span>
        ) : null}
      </div>
      <p className="mt-1">
        {formatDay(booking.check_in)} → {formatDay(booking.check_out)}{" "}
        <span className="muted">
          · {nights} night{nights === 1 ? "" : "s"}
        </span>
      </p>
      {!isBlock ? (
        <p className="text-fine muted mt-1">
          {booking.guests} guests
          {booking.source ? ` · ${SOURCE_LABELS[booking.source]}` : ""}
        </p>
      ) : null}
    </Link>
  );
}
