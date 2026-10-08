import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import type { ISODate } from "./dates";
import type {
  Booking,
  BookingInput,
  BookingWithPayments,
  Enquiry,
  EnquiryStatus,
  Payment,
  PaymentInput,
} from "./types";

/**
 * Thin data access for the admin screens. Every function throws an Error
 * whose message is safe to show the owner or caretaker as-is.
 */

const OFFLINE_MESSAGE = "Couldn't reach the server. Check your internet connection and try again.";
const isNetworkFailure = (message: string) => /failed to fetch|network|load failed/i.test(message);

export function friendlyError(error: Pick<PostgrestError, "code" | "message">): string {
  if (isNetworkFailure(error.message ?? "")) return OFFLINE_MESSAGE;
  switch (error.code) {
    case "23P01":
      return "These dates overlap another booking or blocked dates. Check the calendar and try again.";
    case "23514":
      return "Some details aren't valid. Check that check-out is after check-in, and guests are between 1 and 12.";
    case "42501":
    case "PGRST301":
      return "You don't have access to this. Ask the owner to add your email to the admin list.";
    case "PGRST116":
      return "That record wasn't found. It may have been deleted.";
    default:
      return error.message || "Something went wrong. Check your connection and try again.";
  }
}

function db(): SupabaseClient {
  const client = getSupabase();
  if (!client) throw new Error("Supabase isn't configured for this site yet.");
  return client;
}

function unwrap<T>({ data, error }: { data: T | null; error: PostgrestError | null }): T {
  if (error) throw new Error(friendlyError(error));
  return data as T;
}

// --- Auth -------------------------------------------------------------------

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      error.message === "Invalid login credentials"
        ? "That email and password don't match."
        : isNetworkFailure(error.message)
          ? OFFLINE_MESSAGE
          : error.message
    );
  }
}

export async function signOut(): Promise<void> {
  await db().auth.signOut();
}

/** True when the signed-in user's email is on the admin allowlist. */
export async function checkIsAdmin(): Promise<boolean> {
  return unwrap(await db().rpc("is_admin")) === true;
}

// --- Bookings ---------------------------------------------------------------

/**
 * Confirmed and cancelled rows whose stay touches [from, to). Either bound
 * may be omitted.
 */
export async function listBookings(range: { from?: ISODate; to?: ISODate } = {}) {
  let query = db().from("bookings").select("*, payments(amount)").order("check_in");
  if (range.from) query = query.gt("check_out", range.from);
  if (range.to) query = query.lt("check_in", range.to);
  return unwrap<BookingWithPayments[]>(await query);
}

export async function getBooking(id: string) {
  return unwrap<Booking & { payments: Payment[] }>(
    await db()
      .from("bookings")
      .select("*, payments(*)")
      .eq("id", id)
      .order("paid_on", { referencedTable: "payments" })
      .single()
  );
}

export async function createBooking(input: BookingInput) {
  return unwrap<Booking>(await db().from("bookings").insert(input).select().single());
}

export async function updateBooking(id: string, patch: Partial<BookingInput>) {
  return unwrap<Booking>(
    await db().from("bookings").update(patch).eq("id", id).select().single()
  );
}

// --- Payments ---------------------------------------------------------------

export async function addPayment(input: PaymentInput) {
  return unwrap<Payment>(await db().from("payments").insert(input).select().single());
}

export async function deletePayment(id: string): Promise<void> {
  unwrap(await db().from("payments").delete().eq("id", id));
}

// --- Enquiries --------------------------------------------------------------

export async function listEnquiries() {
  return unwrap<Enquiry[]>(
    await db().from("enquiries").select("*").order("created_at", { ascending: false })
  );
}

export async function getEnquiry(id: string) {
  return unwrap<Enquiry>(await db().from("enquiries").select("*").eq("id", id).single());
}

export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  unwrap(await db().from("enquiries").update({ status }).eq("id", id));
}

export async function countNewEnquiries(): Promise<number> {
  const { count, error } = await db()
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  if (error) throw new Error(friendlyError(error));
  return count ?? 0;
}
