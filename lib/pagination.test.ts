import { describe, expect, it } from "vitest";

import {
  describePageMismatch,
  getNextPageId,
  mergeGames,
  type PageMeta,
} from "@/lib/pagination";
import type { Game } from "@/types/game";

function makeGame(id: string): Game {
  return {
    _id: id,
    title: "بازی ماشین",
    companyName: "Lifelands",
    score: 3,
    rating: 0.5,
    like: 2,
    level: 1,
    runCount: 10,
    seenCount: 20,
    image: "game/file.webp",
    createdAtIso: "2026-01-01T00:00:00.000Z",
    categoryTitle: "رانندگی",
    vendors: ["rubika"],
  };
}

function makePage(overrides: Partial<PageMeta> = {}): PageMeta {
  return {
    pageId: 1,
    eachPerPage: 12,
    total: 729,
    receivedCount: 12,
    ...overrides,
  };
}

describe("getNextPageId", () => {
  it("returns the next page after a full page with more to load", () => {
    expect(getNextPageId(makePage(), 12)).toBe(2);
  });

  it("stops when everything promised by total is loaded", () => {
    expect(getNextPageId(makePage({ pageId: 61 }), 729)).toBeNull();
  });

  it("stops on an empty page even when total promises more", () => {
    expect(getNextPageId(makePage({ pageId: 5, receivedCount: 0 }), 48)).toBeNull();
  });

  it("stops on a short page even when total promises more", () => {
    expect(getNextPageId(makePage({ pageId: 3, receivedCount: 7 }), 31)).toBeNull();
  });

  it.each([0, Number.NaN, -5])("never loops forever when total is %s", (total) => {
    expect(getNextPageId(makePage({ total }), 12)).toBe(2);
    expect(getNextPageId(makePage({ total, receivedCount: 0 }), 12)).toBeNull();
    expect(getNextPageId(makePage({ total, receivedCount: 5 }), 5)).toBeNull();
  });

  it("ends on an empty page when eachPerPage is invalid", () => {
    const page = makePage({ eachPerPage: 0, total: 0, receivedCount: 0 });

    expect(getNextPageId(page, 0)).toBeNull();
  });

  it("counts unique loaded games, so duplicates do not end loading early", () => {
    expect(getNextPageId(makePage({ pageId: 2 }), 20)).toBe(3);
  });
});

describe("describePageMismatch", () => {
  it("reports none for a full page inside the range", () => {
    expect(describePageMismatch(makePage())).toBe("none");
  });

  it("reports none for the legitimate last short page", () => {
    const page = makePage({ pageId: 61, receivedCount: 9 });

    expect(describePageMismatch(page)).toBe("none");
  });

  it("reports empty for a page with no games inside the range", () => {
    expect(describePageMismatch(makePage({ pageId: 4, receivedCount: 0 }))).toBe(
      "empty",
    );
  });

  it("reports short when fewer games arrive but total promises more", () => {
    expect(describePageMismatch(makePage({ pageId: 4, receivedCount: 8 }))).toBe(
      "short",
    );
  });

  it("reports long when a page holds more than eachPerPage", () => {
    expect(describePageMismatch(makePage({ receivedCount: 15 }))).toBe("long");
  });

  it("reports total-exceeded when a page past the end still returns games", () => {
    expect(describePageMismatch(makePage({ pageId: 62, receivedCount: 3 }))).toBe(
      "total-exceeded",
    );
  });

  it("reports none for an empty page past the end", () => {
    expect(describePageMismatch(makePage({ pageId: 62, receivedCount: 0 }))).toBe(
      "none",
    );
  });

  it("reports only what it can prove when total is unknown", () => {
    expect(describePageMismatch(makePage({ total: Number.NaN }))).toBe("none");
    expect(describePageMismatch(makePage({ total: 0, receivedCount: 0 }))).toBe(
      "empty",
    );
    expect(describePageMismatch(makePage({ total: 0, receivedCount: 20 }))).toBe(
      "long",
    );
  });
});

describe("mergeGames", () => {
  it("appends new games and keeps order", () => {
    const merged = mergeGames([makeGame("a"), makeGame("b")], [makeGame("c")]);

    expect(merged.map((game) => game._id)).toEqual(["a", "b", "c"]);
  });

  it("drops ids repeated across pages and keeps the first occurrence", () => {
    const first = makeGame("b");
    const second = { ...makeGame("b"), title: "نسخه دوم" };

    const merged = mergeGames([makeGame("a"), first], [second, makeGame("c")]);

    expect(merged.map((game) => game._id)).toEqual(["a", "b", "c"]);
    expect(merged[1]).toBe(first);
  });

  it("drops duplicates inside the incoming page", () => {
    const merged = mergeGames([], [makeGame("a"), makeGame("a"), makeGame("b")]);

    expect(merged.map((game) => game._id)).toEqual(["a", "b"]);
  });

  it("does not mutate either input", () => {
    const existing = [makeGame("a")];
    const incoming = [makeGame("a"), makeGame("b")];

    const merged = mergeGames(existing, incoming);

    expect(existing).toHaveLength(1);
    expect(incoming).toHaveLength(2);
    expect(merged).not.toBe(existing);
  });
});
