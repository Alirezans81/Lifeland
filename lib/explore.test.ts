import { describe, expect, it } from "vitest";

import { createExplorerFilter, exploreGames } from "@/lib/explore";
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

describe("createExplorerFilter", () => {
  it("builds a browse filter sorted by score for an empty query", () => {
    const filter = createExplorerFilter("   ");

    expect(filter.mode).toBe("browse");
    expect(filter.sort).toBe("score");
  });

  it("builds a relevance search filter with a trimmed query", () => {
    const filter = createExplorerFilter("  ماشین ");

    expect(filter.mode).toBe("search");
    expect(filter.query).toBe("ماشین");
    expect(filter.sort).toBe("relevance");
  });
});

describe("exploreGames", () => {
  const low = makeGame({ _id: "low", title: "ماشین کوچک", score: 1 });
  const high = makeGame({ _id: "high", title: "ماشین بزرگ", score: 9 });
  const other = makeGame({ _id: "other", title: "پازل", score: 5 });
  const games = [low, other, high];
  const noFavorites = new Set<string>();

  it("sorts by score descending in browse mode", () => {
    const result = exploreGames(games, createExplorerFilter(""), noFavorites);

    expect(ids(result)).toEqual(["high", "other", "low"]);
  });

  it("keeps the filtered order in search mode", () => {
    const result = exploreGames(
      games,
      createExplorerFilter("ماشین"),
      noFavorites,
    );

    expect(ids(result)).toEqual(["low", "high"]);
  });
});
