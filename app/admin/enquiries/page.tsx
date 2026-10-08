"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDay, nightsBetween } from "@/lib/admin/dates";
import { guestTelHref, guestWhatsAppHref } from "@/lib/admin/phone";
import { listEnquiries, setEnquiryStatus } from "@/lib/admin/queries";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/admin/types";
import { Notice, PageTitle, Tabs } from "../_components/ui";

const receivedFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export default function EnquiriesPage() {
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<EnquiryStatus>("new");

  const load = useCallback(() => {
    listEnquiries()
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0])) as Record<EnquiryStatus, number>;
    for (const r of rows ?? []) c[r.status]++;
    return c;
  }, [rows]);

  const shown = (rows ?? []).filter((r) => r.status === view);

  const move = async (id: string, status: EnquiryStatus) => {
    try {
      await setEnquiryStatus(id, status);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <PageTitle>Enquiries</PageTitle>
      <Tabs
        label="Filter enquiries"
        value={view}
        onChange={setView}
        options={ENQUIRY_STATUSES.map((s) => ({ value: s, label: ENQUIRY_STATUS_LABELS[s], count: counts[s] }))}
      />
      {error ? (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}
      {rows == null && !error ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="muted">Nothing here.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((e) => (
            <li key={e.id}>
              <EnquiryCard enquiry={e} onMove={move} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EnquiryCard({
  enquiry: e,
  onMove,
}: {
  enquiry: Enquiry;
  onMove: (id: string, status: EnquiryStatus) => void;
}) {
  const tel = guestTelHref(e.phone);
  const wa = guestWhatsAppHref(e.phone);
  const hasDates = e.check_in && e.check_out && e.check_out > e.check_in;

  return (
    <article className="hairline p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">{e.name}</h2>
        <span className="text-fine muted">{receivedFormatter.format(new Date(e.created_at))}</span>
      </div>
      <p className="mt-1">
        {hasDates ? (
          <>
            {formatDay(e.check_in!)} → {formatDay(e.check_out!)}{" "}
            <span className="muted">· {nightsBetween(e.check_in!, e.check_out!)} nights</span>
          </>
        ) : (
          <span className="muted">No dates given</span>
        )}
        {e.guests ? <span className="muted"> · {e.guests} guests</span> : null}
      </p>
      {e.meals ? <p className="text-fine muted mt-1">Meals: {e.meals}</p> : null}
      {e.message ? <p className="mt-2 whitespace-pre-line">{e.message}</p> : null}
      <p className="text-fine mt-2">
        {e.phone}
        {e.email ? ` · ${e.email}` : ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tel ? (
          <a className="btn btn-outline" href={tel}>
            Call
          </a>
        ) : null}
        {wa ? (
          <a className="btn btn-outline" href={wa} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        ) : null}
        {e.status !== "converted" ? (
          <Link className="btn btn-solid" href={`/admin/booking/?enquiry=${e.id}`}>
            Create booking
          </Link>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4">
        {e.status === "new" ? (
          <button type="button" className="btn btn-quiet" onClick={() => onMove(e.id, "contacted")}>
            Mark contacted
          </button>
        ) : null}
        {e.status === "new" || e.status === "contacted" ? (
          <button type="button" className="btn btn-quiet" onClick={() => onMove(e.id, "closed")}>
            Close
          </button>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => onMove(e.id, "contacted")}>
            Reopen
          </button>
        )}
      </div>
    </article>
  );
}
