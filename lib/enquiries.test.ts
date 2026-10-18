import { describe, expect, it } from "vitest";
import { toEnquiryRow } from "./enquiries";

describe("toEnquiryRow", () => {
  it("maps form field names to table columns", () => {
    expect(
      toEnquiryRow({
        name: " Asha Patil ",
        phone: "98200 12345",
        email: "",
        checkIn: "2026-12-24",
        checkOut: "2026-12-27",
        guests: "11",
        meals: "Yes",
        message: "Two kids, one grandparent.",
      })
    ).toEqual({
      name: "Asha Patil",
      phone: "98200 12345",
      email: null,
      check_in: "2026-12-24",
      check_out: "2026-12-27",
      guests: 11,
      meals: "Yes",
      message: "Two kids, one grandparent.",
    });
  });

  it("drops malformed dates and guest counts instead of failing the insert", () => {
    const row = toEnquiryRow({ name: "A", phone: "123", checkIn: "24/12/2026", guests: "lots" });
    expect(row.check_in).toBeNull();
    expect(row.check_out).toBeNull();
    expect(row.guests).toBeNull();
  });

  describe("occasion", () => {
    const base = { name: "A", phone: "1" };

    it("leads the message with the occasion", () => {
      expect(toEnquiryRow({ ...base, occasion: "Wedding / function", message: "Around 80 day guests." }).message).toBe(
        "Occasion: Wedding / function\nAround 80 day guests."
      );
    });

    it("keeps an occasion with no note, and a note with no occasion", () => {
      expect(toEnquiryRow({ ...base, occasion: "Family stay" }).message).toBe("Occasion: Family stay");
      expect(toEnquiryRow({ ...base, message: " Hello " }).message).toBe("Hello");
    });

    it("leaves the message null when both are empty", () => {
      expect(toEnquiryRow({ ...base, occasion: "", message: "  " }).message).toBeNull();
    });

    it("caps the composed message at 4000 characters", () => {
      const row = toEnquiryRow({ ...base, occasion: "Wedding / function", message: "x".repeat(4000) });
      expect(row.message).toHaveLength(4000);
      expect(row.message?.startsWith("Occasion: Wedding / function\n")).toBe(true);
    });
  });

  it("truncates to the database's length limits", () => {
    expect(toEnquiryRow({ name: "x".repeat(500), phone: "1" }).name).toHaveLength(200);
  });
});
