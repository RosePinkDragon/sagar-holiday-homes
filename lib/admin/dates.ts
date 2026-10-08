/**
 * Dates are ISO `YYYY-MM-DD` strings throughout the admin, matching Postgres
 * `date` columns as PostgREST returns them. Arithmetic runs in UTC so a
 * calendar date never shifts with the browser's timezone.
 */

export type ISODate = string;

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000;

const toUTC = (iso: ISODate): number => Date.parse(`${iso}T00:00:00Z`);
const fromUTC = (ms: number): ISODate => new Date(ms).toISOString().slice(0, 10);

export const addDays = (iso: ISODate, days: number): ISODate =>
  fromUTC(toUTC(iso) + days * DAY_MS);

export const nightsBetween = (checkIn: ISODate, checkOut: ISODate): number =>
  Math.round((toUTC(checkOut) - toUTC(checkIn)) / DAY_MS);

/** Half-open [in, out) — mirrors the database's exclusion constraint. */
export const rangesOverlap = (
  aIn: ISODate,
  aOut: ISODate,
  bIn: ISODate,
  bOut: ISODate
): boolean => aIn < bOut && bIn < aOut;

/** The villa runs on India time regardless of where the browser is. */
export const todayIST = (now: Date = new Date()): ISODate =>
  fromUTC(now.getTime() + IST_OFFSET_MS);

/**
 * Monday-first weeks for a month (`month` is 0-based, like Date). Days
 * outside the month are `null` so every week has exactly 7 cells.
 */
export function monthGrid(year: number, month: number): (ISODate | null)[][] {
  const first = Date.UTC(year, month, 1);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = (new Date(first).getUTCDay() + 6) % 7;

  const cells: (ISODate | null)[] = Array(leading).fill(null);
  for (let d = 0; d < daysInMonth; d++) cells.push(fromUTC(first + d * DAY_MS));
  while (cells.length % 7) cells.push(null);

  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

type Stay = { status: string; check_in: ISODate; check_out: ISODate };

/** The confirmed booking or block occupying the night of `iso`, if any. */
export const bookingOn = <T extends Stay>(rows: readonly T[], iso: ISODate): T | undefined =>
  rows.find((r) => r.status === "confirmed" && r.check_in <= iso && iso < r.check_out);

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/**
 * "Mon 14 Dec". Assembled from parts because ICU versions disagree on the
 * comma, and static HTML from the build must match what the browser renders.
 */
export function formatDay(iso: ISODate): string {
  const parts = Object.fromEntries(
    dayFormatter.formatToParts(toUTC(iso)).map((p) => [p.type, p.value])
  );
  return `${parts.weekday} ${parts.day} ${parts.month}`;
}

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "December 2026" */
export const formatMonth = (year: number, month: number): string =>
  monthFormatter.format(Date.UTC(year, month, 1));
