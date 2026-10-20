import { describe, expect, it } from "vitest";

import { formatResultCount } from "@/lib/result-count";

describe("formatResultCount", () => {
  it("uses a dedicated message for zero results", () => {
    expect(formatResultCount(0)).toBe("بازی‌ای پیدا نشد");
  });

  it("uses a dedicated message for one result", () => {
    expect(formatResultCount(1)).toBe("یک بازی پیدا شد");
  });

  it("formats many results with Persian digits", () => {
    expect(formatResultCount(12)).toBe("۱۲ بازی پیدا شد");
  });
});
