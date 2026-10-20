import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("flex", false, null, undefined, "items-center")).toBe(
      "flex items-center",
    );
  });

  it("resolves conflicting Tailwind utilities in favor of the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("supports conditional object syntax", () => {
    expect(cn("p-2", { "text-error": true, "text-success": false })).toBe(
      "p-2 text-error",
    );
  });
});
