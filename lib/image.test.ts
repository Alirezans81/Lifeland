import { describe, expect, it } from "vitest";

import { IMAGE_BASE_URL, resolveImageUrl } from "@/lib/image";

describe("resolveImageUrl", () => {
  it("resolves a relative path on the media host", () => {
    expect(resolveImageUrl("game/file-1791705692709.webp")).toBe(
      "https://dl.lifelands.ir/game/file-1791705692709.webp",
    );
    expect(IMAGE_BASE_URL).toBe("https://dl.lifelands.ir/");
  });

  it("strips leading slashes", () => {
    expect(resolveImageUrl("//game/a.png")).toBe(
      "https://dl.lifelands.ir/game/a.png",
    );
  });

  it("keeps an absolute http or https url unchanged", () => {
    expect(resolveImageUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(resolveImageUrl("http://cdn.example.com/a.png")).toBe(
      "http://cdn.example.com/a.png",
    );
  });

  it("returns null for blank and whitespace-only paths", () => {
    expect(resolveImageUrl("")).toBeNull();
    expect(resolveImageUrl("   ")).toBeNull();
    expect(resolveImageUrl("///")).toBeNull();
  });

  it("returns null for non-http schemes", () => {
    expect(resolveImageUrl("javascript:alert(1)")).toBeNull();
    expect(resolveImageUrl("data:image/png;base64,AAAA")).toBeNull();
  });

  it("returns null for a path with a parent segment", () => {
    expect(resolveImageUrl("game/../secret.png")).toBeNull();
    expect(resolveImageUrl("../secret.png")).toBeNull();
  });

  it("percent-encodes unsafe characters per segment", () => {
    expect(resolveImageUrl("game/my file.png")).toBe(
      "https://dl.lifelands.ir/game/my%20file.png",
    );
  });
});
