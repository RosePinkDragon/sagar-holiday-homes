"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { addDays, formatDay, nightsBetween, todayIST } from "@/lib/admin/dates";
import { guestTelHref, guestWhatsAppHref } from "@/lib/admin/phone";
import {
  createBooking,
  getBooking,
  getEnquiry,
  setEnquiryStatus,
  updateBooking,
} from "@/lib/admin/queries";
import {
  SOURCE_LABELS,
  toBookingInput,
  type Booking,
  type BookingInput,
  type Payment,
} from "@/lib/admin/types";
import BookingForm from "../_components/BookingForm";
import PaymentList from "../_components/PaymentList";
import { Notice, PageTitle } from "../_components/ui";

/**
 * One route for view/edit/create, driven by the query string — static export
 * can't prerender `/admin/booking/[id]` for ids that only exist at runtime.
 *
 *   ?id=…                 view + edit + payments
 *   ?new=booking[&date=…] create a guest booking (date from a calendar tap)
 *   ?new=block[&date=…]   create a block
 *   ?enquiry=…            create a booking pre-filled from a website enquiry
 */
export default function BookingPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <BookingRouter />
    </Suspense>
  );
}

function BookingRouter() {
  const params = useSearchParams();
  const id = params.get("id");
  if (id) return <ExistingBooking key={id} id={id} />;
  return (
    <NewBooking
      key={params.toString()}
      kind={params.get("new") === "block" ? "block" : "booking"}
      date={params.get("date")}
      enquiryId={params.get("enquiry")}
    />
  );
}

const emptyInput = (kind: Booking["kind"], date: string | null): BookingInput => {
  const checkIn = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIST();
  return {
    kind,
    status: "confirmed",
    check_in: checkIn,
    check_out: addDays(checkIn, 1),
    guest_name: null,
    phone: null,
    email: null,
    guests: null,
    source: kind === "booking" ? "direct" : null,
    total_amount: null,
    notes: null,
    enquiry_id: null,
  };
};

function NewBooking({
  kind,
  date,
  enquiryId,
}: {
  kind: Booking["kind"];
  date: string | null;
  enquiryId: string | null;
}) {
  const router = useRouter();
  const [initial, setInitial] = useState<BookingInput | null>(enquiryId ? null : emptyInput(kind, date));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enquiryId) return;
    getEnquiry(enquiryId)
      .then((enq) => {
        const base = emptyInput("booking", enq.check_in);
        setInitial({
          ...base,
          check_out: enq.check_out && enq.check_in && enq.check_out > enq.check_in ? enq.check_out : base.check_out,
          guest_name: enq.name,
          phone: enq.phone,
          email: enq.email,
          guests: enq.guests,
          notes: [enq.meals ? `Meals: ${enq.meals}` : null, enq.message].filter(Boolean).join("\n") || null,
          enquiry_id: enq.id,
        });
      })
      .catch((e: Error) => setError(e.message));
  }, [enquiryId]);

  const save = async (input: BookingInput) => {
    const created = await createBooking(input);
    if (input.enquiry_id) {
      // The booking is saved; a failure here only leaves the enquiry marked "new".
      await setEnquiryStatus(input.enquiry_id, "converted").catch(() => {});
    }
    router.replace(`/admin/booking/?id=${created.id}`);
  };

  return (
    <div className="max-w-xl">
      <PageTitle>{enquiryId ? "Booking from enquiry" : kind === "block" ? "Block dates" : "New booking"}</PageTitle>
      {error ? (
        <Notice tone="error" title="Couldn't load the enquiry">
          {error}
        </Notice>
      ) : initial ? (
        <BookingForm
          initial={initial}
          allowKindChange={!enquiryId}
          submitLabel={kind === "block" ? "Save" : "Save booking"}
          onSubmit={save}
        />
      ) : (
        <p className="muted">Loading…</p>
      )}
    </div>
  );
}

function ExistingBooking({ id }: { id: string }) {
  const [booking, setBooking] = useState<(Booking & { payments: Payment[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(() => {
    getBooking(id)
      .then(setBooking)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

  if (error) {
    return (
      <Notice tone="error" title="Couldn't load this booking">
        {error}
      </Notice>
    );
  }
  if (!booking) return <p className="muted">Loading…</p>;

  const { payments } = booking;
  const input = toBookingInput(booking);
  const isBlock = booking.kind === "block";
  const cancelled = booking.status === "cancelled";
  const nights = nightsBetween(booking.check_in, booking.check_out);
  const tel = booking.phone ? guestTelHref(booking.phone) : null;
  const wa = booking.phone ? guestWhatsAppHref(booking.phone) : null;

  const setStatus = async (status: Booking["status"]) => {
    setStatusError(null);
    try {
      await updateBooking(id, { status });
      setConfirmCancel(false);
      load();
    } catch (e) {
      setStatusError((e as Error).message);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="mb-2">
          <Link href="/admin/" className="link text-fine">
            ← Calendar
          </Link>
        </p>
        <PageTitle>{isBlock ? "Blocked dates" : booking.guest_name}</PageTitle>

        {cancelled ? (
          <div className="mb-5">
            <Notice tone="warn" title="Cancelled">
              These dates are free again.
            </Notice>
          </div>
        ) : null}

        {editing ? (
          <BookingForm
            initial={input}
            allowKindChange={false}
            submitLabel="Save changes"
            onSubmit={async (next) => {
              await updateBooking(id, next);
              setEditing(false);
              load();
            }}
          />
        ) : (
          <>
            <dl className="space-y-3">
              <Row label="Dates">
                {formatDay(booking.check_in)} → {formatDay(booking.check_out)} · {nights} night{nights === 1 ? "" : "s"}
              </Row>
              {!isBlock ? (
                <>
                  <Row label="Guests">{booking.guests}</Row>
                  <Row label="Booked via">{booking.source ? SOURCE_LABELS[booking.source] : "—"}</Row>
                  <Row label="Phone">
                    {booking.phone ?? "—"}
                    {tel || wa ? (
                      <span className="ml-3 inline-flex gap-3">
                        {tel ? (
                          <a className="link" href={tel}>
                            Call
                          </a>
                        ) : null}
                        {wa ? (
                          <a className="link" href={wa} target="_blank" rel="noreferrer">
                            WhatsApp
                          </a>
                        ) : null}
                      </span>
                    ) : null}
                  </Row>
                  {booking.email ? <Row label="Email">{booking.email}</Row> : null}
                </>
              ) : null}
              {booking.notes ? (
                <Row label={isBlock ? "Reason" : "Notes"}>
                  <span className="whitespace-pre-line">{booking.notes}</span>
                </Row>
              ) : null}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(true)}>
                Edit
              </button>
              {cancelled ? (
                <button type="button" className="btn btn-outline" onClick={() => setStatus("confirmed")}>
                  Restore {isBlock ? "block" : "booking"}
                </button>
              ) : confirmCancel ? (
                <>
                  <button type="button" className="btn btn-solid" onClick={() => setStatus("cancelled")}>
                    Yes, cancel {isBlock ? "block" : "booking"}
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => setConfirmCancel(false)}>
                    Keep it
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-quiet" onClick={() => setConfirmCancel(true)}>
                  Cancel {isBlock ? "block" : "booking"}…
                </button>
              )}
            </div>
            {statusError ? (
              <div className="mt-4">
                <Notice tone="error">{statusError}</Notice>
              </div>
            ) : null}
          </>
        )}
      </div>

      {!isBlock ? (
        <PaymentList bookingId={id} total={booking.total_amount} payments={payments} onChanged={load} />
      ) : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="label pt-0.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
