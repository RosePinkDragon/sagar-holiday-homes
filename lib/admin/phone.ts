/**
 * Guest numbers arrive however people type them ("98200 12345", "+91-98...",
 * "098..."). Normalise to E.164 digits so call / WhatsApp buttons work.
 * Most guests are Indian, so a bare 10-digit number is assumed to be +91.
 */
function toE164Digits(raw: string): string | null {
  const hasPlus = raw.trim().startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!hasPlus) {
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) digits = `91${digits}`;
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export function guestWhatsAppHref(raw: string): string | null {
  const digits = toE164Digits(raw);
  return digits ? `https://wa.me/${digits}` : null;
}

export function guestTelHref(raw: string): string | null {
  const digits = toE164Digits(raw);
  return digits ? `tel:+${digits}` : null;
}
