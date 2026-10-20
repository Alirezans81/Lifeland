import { describe, expect, it } from "vitest";

import { sortGames } from "@/lib/sort";
import type { Game } from "@/types/game";
import type { SortKey } from "@/types/sort";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    _id: "game-1",
    title: "بازی ماشین",
    companyName: "Lifelands",
    score: 0,
    rating: 0,
    like: 0,
    level: 1,
    runCount: 0,
    seenCount: 0,
    image: "game/file.webp",
    createdAtIso: "2026-01-01T00:00:00.000Z",
    categoryTitle: "رانندگی",
    vendors: ["rubika"],
    ...overrides,
  };
}

function ids(games: readonly Game[]): string[] {
  return games.map((game) => game._id);
}

describe("sortGames", () => {
  const low = makeGame({
    _id: "low",
    score: 1,
    rating: 0.1,
    like: 1,
    runCount: 5,
    seenCount: 9,
  });
  const mid = makeGame({
    _id: "mid",
    score: 3,
    rating: 0.6,
    like: 8,
    runCount: 50,
    seenCount: 90,
  });
  const high = makeGame({
    _id: "high",
    score: 4.8,
    rating: 1.1,
    like: 20,
    runCount: 500,
    seenCount: 900,
  });
  const keys: SortKey[] = ["score", "like", "runCount", "seenCount", "quality"];

  it.each(keys)("sorts %s in descending order", (key) => {
    expect(ids(sortGames([low, high, mid], key))).toEqual(["high", "mid", "low"]);
  });

  it("breaks ties by _id ascending", () => {
    const b = makeGame({ _id: "b", score: 3 });
    const a = makeGame({ _id: "a", score: 3 });
    const c = makeGame({ _id: "c", score: 3 });

    expect(ids(sortGames([c, a, b], "score"))).toEqual(["a", "b", "c"]);
  });

  it("returns the same order for any input order", () => {
    const b = makeGame({ _id: "b", like: 4 });
    const a = makeGame({ _id: "a", like: 4 });
    const c = makeGame({ _id: "c", like: 9 });

    const forward = ids(sortGames([a, b, c], "like"));
    const backward = ids(sortGames([c, b, a], "like"));

    expect(forward).toEqual(["c", "a", "b"]);
    expect(backward).toEqual(forward);
  });

  it("does not mutate the input", () => {
    const input = [low, high, mid];

    const sorted = sortGames(input, "score");

    expect(ids(input)).toEqual(["low", "high", "mid"]);
    expect(sorted).not.toBe(input);
  });

  it("ranks a zero-score game with a nonzero rating above an unrated game by quality", () => {
    const unrated = makeGame({ _id: "a-unrated" });
    const ratedOnly = makeGame({ _id: "z-rated", score: 0, rating: 0.9 });

    expect(ids(sortGames([unrated, ratedOnly], "quality"))).toEqual([
      "z-rated",
      "a-unrated",
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(sortGames([], "quality")).toEqual([]);
  });

  it("rejects keys that are not sortable", () => {
    // @ts-expect-error relevance is not a SortKey
    sortGames([low], "relevance");
    // @ts-expect-error level is kept out of sorting
    sortGames([low], "level");

    expect(true).toBe(true);
  });
});

