import { describe, expect, it } from "vitest";

import { MAX_PAGE_ID, parsePageIdParam } from "@/lib/page-id";

describe("parsePageIdParam", () => {
  it("treats a missing value as page 1", () => {
    expect(parsePageIdParam(null)).toBe(1);
  });

  it("accepts positive integers up to the maximum", () => {
    expect(parsePageIdParam("1")).toBe(1);
    expect(parsePageIdParam("12")).toBe(12);
    expect(parsePageIdParam(String(MAX_PAGE_ID))).toBe(MAX_PAGE_ID);
  });

  it.each(["0", "-1", "1.5", "01", "", "abc", " 2", "2 ", "1e2", "+3"])(
    "rejects %j",
    (value) => {
      expect(parsePageIdParam(value)).toBeNull();
    },
  );

  it("rejects values above the maximum", () => {
    expect(parsePageIdParam(String(MAX_PAGE_ID + 1))).toBeNull();
    expect(parsePageIdParam("99999999999")).toBeNull();
  });
});
