/**
 * Row shapes for supabase/schema.sql. Enum values must stay in step with the
 * CHECK constraints there; labels are admin UI copy, not property facts.
 */

import type { ISODate } from "./dates";

export const BOOKING_SOURCES = ["direct", "airbnb", "booking_com", "other"] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];
export const SOURCE_LABELS: Record<BookingSource, string> = {
  direct: "Direct",
  airbnb: "Airbnb",
  booking_com: "Booking.com",
  other: "Other",
};

export const PAYMENT_METHODS = ["upi", "bank", "cash", "ota_payout", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  bank: "Bank transfer",
  cash: "Cash",
  ota_payout: "OTA payout",
  other: "Other",
};

export const ENQUIRY_STATUSES = ["new", "contacted", "converted", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Booked",
  closed: "Closed",
};

export type BookingKind = "booking" | "block";
export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  kind: BookingKind;
  status: BookingStatus;
  check_in: ISODate;
  check_out: ISODate;
  guest_name: string | null;
  phone: string | null;
  email: string | null;
  guests: number | null;
  source: BookingSource | null;
  total_amount: number | null;
  notes: string | null;
  enquiry_id: string | null;
  created_at: string;
  updated_at: string;
}

/** What the booking form sends — server fills id and timestamps. */
export type BookingInput = Omit<Booking, "id" | "created_at" | "updated_at">;

export const toBookingInput = (b: Booking): BookingInput => ({
  kind: b.kind,
  status: b.status,
  check_in: b.check_in,
  check_out: b.check_out,
  guest_name: b.guest_name,
  phone: b.phone,
  email: b.email,
  guests: b.guests,
  source: b.source,
  total_amount: b.total_amount,
  notes: b.notes,
  enquiry_id: b.enquiry_id,
});

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  paid_on: ISODate;
  method: PaymentMethod;
  note: string | null;
  created_at: string;
}

export type PaymentInput = Omit<Payment, "id" | "created_at">;

export interface Enquiry {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  check_in: ISODate | null;
  check_out: ISODate | null;
  guests: number | null;
  meals: string | null;
  message: string | null;
  status: EnquiryStatus;
}

export type EnquiryInput = Omit<Enquiry, "id" | "created_at" | "status">;

/** Booking row joined with its payments, as the list screens load it. */
export type BookingWithPayments = Booking & { payments: Pick<Payment, "amount">[] };
