"use client";

import { useState, type FormEvent } from "react";
import { facts } from "@/content/property";
import { nightsBetween } from "@/lib/admin/dates";
import { BOOKING_SOURCES, SOURCE_LABELS, type BookingInput, type BookingKind } from "@/lib/admin/types";
import { ErrorText, Field } from "./ui";

const MAX_GUESTS = facts.occupancy.max.value;

type Draft = {
  kind: BookingKind;
  check_in: string;
  check_out: string;
  guest_name: string;
  phone: string;
  email: string;
  guests: string;
  source: string;
  total_amount: string;
  notes: string;
};

const toDraft = (b: BookingInput): Draft => ({
  kind: b.kind,
  check_in: b.check_in,
  check_out: b.check_out,
  guest_name: b.guest_name ?? "",
  phone: b.phone ?? "",
  email: b.email ?? "",
  guests: b.guests == null ? "" : String(b.guests),
  source: b.source ?? "direct",
  total_amount: b.total_amount == null ? "" : String(b.total_amount),
  notes: b.notes ?? "",
});

const blankToNull = (s: string) => (s.trim() === "" ? null : s.trim());

function validate(d: Draft): string | null {
  if (!d.check_in || !d.check_out) return "Pick both dates.";
  if (d.check_out <= d.check_in) return "Check-out has to be after check-in.";
  if (d.kind === "block") return null;
  if (!d.guest_name.trim()) return "Add the guest's name.";
  const guests = Number(d.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS)
    return `Guests must be between 1 and ${MAX_GUESTS}.`;
  if (d.total_amount && !(Number(d.total_amount) >= 0)) return "Amount must be a number.";
  return null;
}

function toInput(d: Draft, base: BookingInput): BookingInput {
  const isBlock = d.kind === "block";
  return {
    ...base,
    kind: d.kind,
    check_in: d.check_in,
    check_out: d.check_out,
    notes: blankToNull(d.notes),
    guest_name: isBlock ? null : d.guest_name.trim(),
    phone: isBlock ? null : blankToNull(d.phone),
    email: isBlock ? null : blankToNull(d.email),
    guests: isBlock ? null : Number(d.guests),
    source: isBlock ? null : (d.source as BookingInput["source"]),
    total_amount: isBlock || !d.total_amount ? null : Number(d.total_amount),
  };
}

export default function BookingForm({
  initial,
  allowKindChange,
  submitLabel,
  onSubmit,
}: {
  initial: BookingInput;
  allowKindChange: boolean;
  submitLabel: string;
  onSubmit: (input: BookingInput) => Promise<void>;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(initial));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) =>
    setD((prev) => ({ ...prev, [k]: e.target.value }));

  const isBlock = d.kind === "block";
  const nights = d.check_in && d.check_out > d.check_in ? nightsBetween(d.check_in, d.check_out) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate(d);
    if (problem) return setError(problem);
    setError(null);
    setBusy(true);
    try {
      await onSubmit(toInput(d, initial));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {allowKindChange ? (
        <fieldset>
          <legend className="label">Type</legend>
          <div className="mt-2 flex gap-2">
            {(["booking", "block"] as const).map((k) => (
              <label
                key={k}
                className={`btn ${d.kind === k ? "btn-solid" : "btn-outline"} has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-alphonso`}
                style={{ minHeight: 40 }}
              >
                <input
                  type="radio"
                  name="kind"
                  value={k}
                  checked={d.kind === k}
                  onChange={set("kind")}
                  className="sr-only"
                />
                {k === "booking" ? "Guest booking" : "Block dates"}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Check-in" htmlFor="check_in">
          <input id="check_in" type="date" className="field" value={d.check_in} onChange={set("check_in")} required />
        </Field>
        <Field label="Check-out" htmlFor="check_out" hint={nights ? `${nights} night${nights === 1 ? "" : "s"}` : undefined}>
          <input
            id="check_out"
            type="date"
            className="field"
            value={d.check_out}
            min={d.check_in || undefined}
            onChange={set("check_out")}
            required
          />
        </Field>
      </div>

      {!isBlock ? (
        <>
          <Field label="Guest name" htmlFor="guest_name">
            <input id="guest_name" className="field" value={d.guest_name} onChange={set("guest_name")} required autoComplete="off" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone">
              <input id="phone" type="tel" className="field" value={d.phone} onChange={set("phone")} autoComplete="off" />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" className="field" value={d.email} onChange={set("email")} autoComplete="off" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Guests" htmlFor="guests" hint={`Max ${MAX_GUESTS}`}>
              <input
                id="guests"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_GUESTS}
                className="field"
                value={d.guests}
                onChange={set("guests")}
                required
              />
            </Field>
            <Field label="Booked via" htmlFor="source">
              <select id="source" className="field" value={d.source} onChange={set("source")}>
                {BOOKING_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Agreed total (₹)"
            htmlFor="total_amount"
            hint="What the guest pays in total, as agreed. For OTA bookings, the payout you expect."
          >
            <input
              id="total_amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              className="field"
              value={d.total_amount}
              onChange={set("total_amount")}
            />
          </Field>
        </>
      ) : null}

      <Field label={isBlock ? "Reason (optional)" : "Notes"} htmlFor="notes">
        {isBlock ? (
          <input id="notes" className="field" value={d.notes} onChange={set("notes")} placeholder="Family visit, repairs…" />
        ) : (
          <textarea id="notes" rows={3} className="field" value={d.notes} onChange={set("notes")} />
        )}
      </Field>

      <ErrorText message={error} />
      <button type="submit" className="btn btn-solid w-full sm:w-auto" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
