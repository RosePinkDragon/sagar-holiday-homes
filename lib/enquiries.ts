import { getSupabase } from "@/lib/supabase";
import type { EnquiryInput } from "@/lib/admin/types";

/**
 * Maps the public enquiry form's field names (content/property.ts
 * `enquiryForm.fields`) onto the `enquiries` table. Exported for tests.
 */
export function toEnquiryRow(data: Record<string, string>): EnquiryInput {
  const text = (k: string, max: number) => {
    const v = (data[k] ?? "").trim();
    return v ? v.slice(0, max) : null;
  };
  const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(data[k] ?? "") ? data[k] : null);
  const guests = Number.parseInt(data.guests ?? "", 10);

  return {
    name: text("name", 200) ?? "",
    phone: text("phone", 40) ?? "",
    email: text("email", 200),
    check_in: date("checkIn"),
    check_out: date("checkOut"),
    guests: guests >= 1 && guests <= 100 ? guests : null,
    meals: text("meals", 40),
    message: text("message", 4000),
  };
}

/**
 * Saves a website enquiry so it shows up in /admin. Resolves false (never
 * throws) when Supabase isn't configured or the insert fails — the email
 * notification is sent independently, so the visitor isn't blocked by this.
 *
 * No `.select()` after the insert: the public (anon) role can write
 * enquiries but deliberately can't read them back.
 */
export async function saveEnquiry(data: Record<string, string>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("enquiries").insert(toEnquiryRow(data));
    return !error;
  } catch {
    return false;
  }
}
