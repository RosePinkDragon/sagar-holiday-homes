"use client";

import { useState, type FormEvent } from "react";
import { formatInr } from "@/content/property";
import { formatDay, todayIST } from "@/lib/admin/dates";
import { amountPaid, balanceDue } from "@/lib/admin/money";
import { addPayment, deletePayment } from "@/lib/admin/queries";
import { METHOD_LABELS, PAYMENT_METHODS, type Payment, type PaymentMethod } from "@/lib/admin/types";
import { ErrorText, Field } from "./ui";

export default function PaymentList({
  bookingId,
  total,
  payments,
  onChanged,
}: {
  bookingId: string;
  total: number | null;
  payments: Payment[];
  onChanged: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(todayIST());
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const received = amountPaid(payments);
  const balance = balanceDue(total, payments);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!(value > 0)) return setError("Enter an amount above zero.");
    setError(null);
    setBusy(true);
    try {
      await addPayment({ booking_id: bookingId, amount: value, paid_on: paidOn, method, note: note.trim() || null });
      setAmount("");
      setNote("");
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await deletePayment(id);
      setConfirmingDelete(null);
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section aria-labelledby="payments-heading">
      <h2 id="payments-heading" className="type-display" style={{ fontSize: "var(--step-1)" }}>
        Payments
      </h2>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Agreed" value={total == null ? "—" : formatInr(total)} />
        <Stat label="Received" value={formatInr(received)} />
        <Stat
          label={balance != null && balance < 0 ? "To refund" : "Balance"}
          value={balance == null ? "—" : formatInr(Math.abs(balance))}
          emphasis={balance != null && balance !== 0}
        />
      </dl>

      {payments.length ? (
        <ul className="mt-4 divide-y" style={{ borderColor: "var(--hairline)" }}>
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold">{formatInr(p.amount)}</p>
                <p className="text-fine muted">
                  {formatDay(p.paid_on)} · {METHOD_LABELS[p.method]}
                  {p.note ? ` · ${p.note}` : ""}
                </p>
              </div>
              {confirmingDelete === p.id ? (
                <span className="flex gap-2">
                  <button type="button" className="btn btn-outline" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => setConfirmingDelete(null)}>
                    Keep
                  </button>
                </span>
              ) : (
                <button type="button" className="btn btn-quiet" onClick={() => setConfirmingDelete(p.id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted mt-4">No payments recorded yet.</p>
      )}

      <form onSubmit={submit} noValidate className="hairline mt-6 space-y-4 p-4">
        <p className="font-semibold">Record a payment</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (₹)" htmlFor="pay_amount">
            <input
              id="pay_amount"
              type="number"
              inputMode="decimal"
              min={1}
              className="field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Date" htmlFor="pay_date">
            <input id="pay_date" type="date" className="field" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          </Field>
        </div>
        <Field label="Method" htmlFor="pay_method">
          <select id="pay_method" className="field" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Note (optional)" htmlFor="pay_note">
          <input id="pay_note" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Advance, UPI ref…" />
        </Field>
        <ErrorText message={error} />
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Saving…" : "Add payment"}
        </button>
      </form>
    </section>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="hairline p-2">
      <dt className="label">{label}</dt>
      <dd className="mt-1 font-semibold" style={emphasis ? { color: "var(--laterite)" } : undefined}>
        {value}
      </dd>
    </div>
  );
}
