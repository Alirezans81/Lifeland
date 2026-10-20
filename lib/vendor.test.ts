import { describe, expect, it } from "vitest";

import { isVendor, VENDORS } from "@/lib/vendor";

describe("isVendor", () => {
  it("accepts every supported vendor", () => {
    for (const vendor of VENDORS) {
      expect(isVendor(vendor)).toBe(true);
    }
  });

  it("rejects unknown vendors", () => {
    expect(isVendor("bale")).toBe(false);
    expect(isVendor("")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(isVendor("Rubika")).toBe(false);
  });

  it("rejects inherited object keys", () => {
    expect(isVendor("toString")).toBe(false);
    expect(isVendor("constructor")).toBe(false);
  });

  it("narrows an arbitrary string array to Vendor", () => {
    const received: string[] = ["rubika", "unknown", "soroush"];
    const vendors = received.filter(isVendor);

    expect(vendors).toEqual(["rubika", "soroush"]);
  });
});
