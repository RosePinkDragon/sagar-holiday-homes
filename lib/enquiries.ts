import { getSupabase } from "@/lib/supabase";
import type { EnquiryInput } from "@/lib/admin/types";

const MESSAGE_MAX = 4000;

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

  // The table has no occasion column; keep it by leading the message with it,
  // then apply the message cap to the whole composed string.
  const occasion = text("occasion", 40);
  const note = (data.message ?? "").trim();
  const composed = [occasion ? `Occasion: ${occasion}` : "", note].filter(Boolean).join("\n");
  const message = composed ? composed.slice(0, MESSAGE_MAX) : null;

  return {
    name: text("name", 200) ?? "",
    phone: text("phone", 40) ?? "",
    email: text("email", 200),
    check_in: date("checkIn"),
    check_out: date("checkOut"),
    guests: guests >= 1 && guests <= 100 ? guests : null,
    meals: text("meals", 40),
    message,
  };
}

/**
 * Saves a website enquiry so it shows up in /admin. Resolves false (never
 * throws) when Supabase isn't configured or the insert fails, so the form can
 * show its fallback message — this insert is the only place an enquiry goes.
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
