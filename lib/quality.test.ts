import { describe, expect, it } from "vitest";

import { qualityScore } from "@/lib/quality";
import type { Game } from "@/types/game";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    _id: "game-1",
    title: "بازی ماشین",
    companyName: "Lifelands",
    score: 0,
    rating: 0,
    like: 0,
    level: 1,
    runCount: 10,
    seenCount: 20,
    image: "game/file.webp",
    createdAtIso: "2026-01-01T00:00:00.000Z",
    categoryTitle: "رانندگی",
    vendors: ["rubika"],
    ...overrides,
  };
}

describe("qualityScore", () => {
  it("scores a game with all zeros as 0", () => {
    expect(qualityScore(makeGame())).toBe(0);
  });

  it("scores the maximum values as 1", () => {
    expect(qualityScore(makeGame({ score: 5, rating: 1.2, like: 25 }))).toBeCloseTo(
      1,
      10,
    );
  });

  it("clamps values above the caps", () => {
    const capped = qualityScore(makeGame({ score: 5, rating: 1.2, like: 25 }));
    const above = qualityScore(makeGame({ score: 50, rating: 9, like: 900 }));

    expect(above).toBeCloseTo(capped, 10);
  });

  it("ranks a zero score with a nonzero rating above an all-zero game", () => {
    const unrated = qualityScore(makeGame());
    const ratedOnly = qualityScore(makeGame({ score: 0, rating: 0.8 }));
    const ratedAndScored = qualityScore(makeGame({ score: 3, rating: 0.8 }));

    expect(ratedOnly).toBeGreaterThan(unrated);
    expect(ratedOnly).toBeLessThan(ratedAndScored);
  });

  it("values the first likes more than the last likes", () => {
    const firstFive = qualityScore(makeGame({ like: 5 })) - qualityScore(makeGame());
    const lastFive =
      qualityScore(makeGame({ like: 25 })) - qualityScore(makeGame({ like: 20 }));

    expect(firstFive).toBeGreaterThan(lastFive);
  });

  it("counts negative and non-finite inputs as 0", () => {
    const broken = makeGame({
      score: Number.NaN,
      rating: -2,
      like: Number.POSITIVE_INFINITY * -1,
    });

    expect(qualityScore(broken)).toBe(0);
  });

  it("ignores level, runCount, and seenCount", () => {
    const base = makeGame({ score: 2, rating: 0.4, like: 3 });
    const popular = makeGame({
      score: 2,
      rating: 0.4,
      like: 3,
      level: 9,
      runCount: 17000,
      seenCount: 27000,
    });

    expect(qualityScore(popular)).toBe(qualityScore(base));
  });
});
