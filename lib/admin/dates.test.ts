import { describe, expect, it } from "vitest";
import {
  addDays,
  bookingOn,
  formatDay,
  monthGrid,
  nightsBetween,
  rangesOverlap,
  todayIST,
} from "./dates";

describe("nightsBetween", () => {
  it("counts nights with an exclusive check-out", () => {
    expect(nightsBetween("2026-12-10", "2026-12-12")).toBe(2);
  });
  it("crosses month and year boundaries", () => {
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
  });
});

describe("addDays", () => {
  it("rolls over months", () => {
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
  });
});

describe("rangesOverlap (half-open)", () => {
  it("detects an overlap", () => {
    expect(rangesOverlap("2026-12-10", "2026-12-12", "2026-12-11", "2026-12-13")).toBe(true);
  });
  it("allows back-to-back stays", () => {
    expect(rangesOverlap("2026-12-10", "2026-12-12", "2026-12-12", "2026-12-14")).toBe(false);
    expect(rangesOverlap("2026-12-12", "2026-12-14", "2026-12-10", "2026-12-12")).toBe(false);
  });
  it("detects containment", () => {
    expect(rangesOverlap("2026-12-01", "2026-12-31", "2026-12-10", "2026-12-11")).toBe(true);
  });
});

describe("todayIST", () => {
  it("is already tomorrow in India at 20:00 UTC", () => {
    expect(todayIST(new Date("2026-10-08T20:00:00Z"))).toBe("2026-10-09");
  });
  it("is still today in India at 18:00 UTC", () => {
    expect(todayIST(new Date("2026-10-08T18:00:00Z"))).toBe("2026-10-08");
  });
});

describe("monthGrid", () => {
  it("starts weeks on Monday and pads with nulls", () => {
    // 1 Oct 2026 is a Thursday.
    const weeks = monthGrid(2026, 9);
    expect(weeks[0]).toEqual([null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(31);
    expect(days.at(-1)).toBe("2026-10-31");
  });
  it("handles a month starting on Monday", () => {
    // 1 Feb 2027 is a Monday.
    expect(monthGrid(2027, 1)[0][0]).toBe("2027-02-01");
  });
});

describe("bookingOn", () => {
  const rows = [
    { id: "a", status: "confirmed" as const, check_in: "2026-12-10", check_out: "2026-12-12" },
    { id: "b", status: "cancelled" as const, check_in: "2026-12-12", check_out: "2026-12-14" },
    { id: "c", status: "confirmed" as const, check_in: "2026-12-12", check_out: "2026-12-14" },
  ];
  it("finds the confirmed stay covering a night", () => {
    expect(bookingOn(rows, "2026-12-11")?.id).toBe("a");
  });
  it("treats check-out day as belonging to the next guest", () => {
    expect(bookingOn(rows, "2026-12-12")?.id).toBe("c");
  });
  it("ignores cancelled rows and returns undefined for free nights", () => {
    expect(bookingOn(rows.slice(0, 2), "2026-12-13")).toBeUndefined();
  });
});

describe("formatDay", () => {
  it("formats without timezone drift", () => {
    expect(formatDay("2026-12-14")).toBe("Mon 14 Dec");
  });
});
