import { describe, expect, it } from "vitest";
import { amountPaid, balanceDue } from "./money";

describe("amountPaid", () => {
  it("sums payments", () => {
    expect(amountPaid([{ amount: 5000 }, { amount: 12500.5 }])).toBe(17500.5);
  });
  it("is zero with no payments", () => {
    expect(amountPaid([])).toBe(0);
  });
});

describe("balanceDue", () => {
  it("subtracts payments from the agreed total", () => {
    expect(balanceDue(36000, [{ amount: 10000 }])).toBe(26000);
  });
  it("can go negative when overpaid (refund owed)", () => {
    expect(balanceDue(1000, [{ amount: 1500 }])).toBe(-500);
  });
  it("is null when no total has been agreed", () => {
    expect(balanceDue(null, [{ amount: 1000 }])).toBeNull();
  });
});
