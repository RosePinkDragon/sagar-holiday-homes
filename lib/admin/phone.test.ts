import { describe, expect, it } from "vitest";
import { guestTelHref, guestWhatsAppHref } from "./phone";

describe("guest phone links", () => {
  it("assumes India for a bare 10-digit mobile", () => {
    expect(guestWhatsAppHref("98200 12345")).toBe("https://wa.me/919820012345");
    expect(guestTelHref("98200 12345")).toBe("tel:+919820012345");
  });
  it("keeps an explicit country code", () => {
    expect(guestWhatsAppHref("+44 7700 900123")).toBe("https://wa.me/447700900123");
  });
  it("drops a trunk 0 before a 10-digit Indian number", () => {
    expect(guestWhatsAppHref("098200 12345")).toBe("https://wa.me/919820012345");
  });
  it("accepts 91-prefixed numbers typed without a plus", () => {
    expect(guestWhatsAppHref("91 98200 12345")).toBe("https://wa.me/919820012345");
  });
  it("returns null for something that isn't a phone number", () => {
    expect(guestWhatsAppHref("call me")).toBeNull();
    expect(guestTelHref("")).toBeNull();
  });
});
