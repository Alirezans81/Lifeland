import { describe, expect, it } from "vitest";

import { normalizePersian } from "@/lib/normalize";

describe("normalizePersian", () => {
  it("converts Persian and Arabic-Indic digits to Latin digits", () => {
    expect(normalizePersian("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(normalizePersian("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(normalizePersian("بازی ۲۰۲۶ و ٢٠٢٦")).toBe("بازی 2026 و 2026");
  });

  it("unifies Arabic yeh and kaf with the Persian letters", () => {
    expect(normalizePersian("علي")).toBe("علی");
    expect(normalizePersian("كتاب")).toBe("کتاب");
    expect(normalizePersian("كيك")).toBe(normalizePersian("کیک"));
  });

  it("removes zero-width non-joiners", () => {
    expect(normalizePersian("می‌خواهم")).toBe("میخواهم");
    expect(normalizePersian("می‌خواهم")).toBe(normalizePersian("میخواهم"));
  });

  it("collapses whitespace runs and trims both ends", () => {
    expect(normalizePersian("  بازی   ماشین \t رانی\n")).toBe("بازی ماشین رانی");
  });

  it("lowercases Latin letters", () => {
    expect(normalizePersian("Lifelands")).toBe("lifelands");
  });

  it("returns an empty string for empty and whitespace-only input", () => {
    expect(normalizePersian("")).toBe("");
    expect(normalizePersian("   \u200C  ")).toBe("");
  });

  it("is idempotent", () => {
    const samples = ["  كيك ۱۲۳  می‌خواهم ", "Lifelands ٤٥٦", "بازی"];

    for (const sample of samples) {
      expect(normalizePersian(normalizePersian(sample))).toBe(
        normalizePersian(sample),
      );
    }
  });
});
