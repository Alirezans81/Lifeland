import { describe, expect, it } from "vitest";

import { filterGames } from "@/lib/filter";
import type { FilterState } from "@/types/filter";
import type { Game } from "@/types/game";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    _id: "game-1",
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
    ...overrides,
  };
}

type CriteriaOverrides = Partial<
  Pick<FilterState, "vendors" | "category" | "scoreRange" | "favoritesOnly">
>;

function makeBrowseFilter(overrides: CriteriaOverrides = {}): FilterState {
  return {
    vendors: [],
    category: null,
    scoreRange: null,
    favoritesOnly: false,
    ...overrides,
    mode: "browse",
    sort: "score",
  };
}

function makeSearchFilter(
  query: string,
  overrides: CriteriaOverrides = {},
): FilterState {
  return {
    vendors: [],
    category: null,
    scoreRange: null,
    favoritesOnly: false,
    ...overrides,
    mode: "search",
    query,
    sort: "relevance",
  };
}

const noFavorites: ReadonlySet<string> = new Set();

function ids(games: readonly Game[]): string[] {
  return games.map((game) => game._id);
}

describe("filterGames search", () => {
  const games = [
    makeGame({ _id: "car", title: "بازی ماشین", companyName: "Lifelands" }),
    makeGame({ _id: "cake", title: "کیک ۲۰", companyName: "" }),
    makeGame({ _id: "walk", title: "می‌خواهم راه بروم", companyName: "Vahid" }),
  ];

  it("matches title and companyName with variant letters, digits, and case", () => {
    expect(ids(filterGames(games, makeSearchFilter("كيك ٢٠"), noFavorites))).toEqual(
      ["cake"],
    );
    expect(ids(filterGames(games, makeSearchFilter("LIFELANDS"), noFavorites))).toEqual(
      ["car"],
    );
    expect(ids(filterGames(games, makeSearchFilter("میخواهم"), noFavorites))).toEqual(
      ["walk"],
    );
  });

  it("requires every query token to match, in any order", () => {
    expect(ids(filterGames(games, makeSearchFilter("ماشین بازی"), noFavorites))).toEqual(
      ["car"],
    );
    expect(ids(filterGames(games, makeSearchFilter("بازی کیک"), noFavorites))).toEqual(
      [],
    );
  });

  it("keeps every game for an empty or whitespace-only query", () => {
    expect(filterGames(games, makeSearchFilter(""), noFavorites)).toHaveLength(3);
    expect(filterGames(games, makeSearchFilter("   "), noFavorites)).toHaveLength(3);
  });

  it("does not let an empty companyName match as text", () => {
    expect(ids(filterGames(games, makeSearchFilter("vahid"), noFavorites))).toEqual(
      ["walk"],
    );
    expect(filterGames(games, makeSearchFilter("undefined"), noFavorites)).toEqual([]);
  });
});

describe("filterGames vendors", () => {
  const games = [
    makeGame({ _id: "rubika", vendors: ["rubika"] }),
    makeGame({ _id: "soroush", vendors: ["soroush"] }),
    makeGame({ _id: "both", vendors: ["rubika", "soroush"] }),
    makeGame({ _id: "none", vendors: [] }),
  ];

  it("includes games without vendors while no vendor is selected", () => {
    expect(ids(filterGames(games, makeBrowseFilter(), noFavorites))).toEqual([
      "rubika",
      "soroush",
      "both",
      "none",
    ]);
  });

  it("excludes games without vendors once any vendor is selected", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ vendors: ["rubika"] }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["rubika", "both"]);
  });

  it("matches when at least one selected vendor is present", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ vendors: ["rubika", "soroush"] }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["rubika", "soroush", "both"]);
  });
});

describe("filterGames category", () => {
  const games = [
    makeGame({ _id: "trimmed", categoryTitle: "رانندگی" }),
    makeGame({ _id: "trailing", categoryTitle: "رانندگی " }),
    makeGame({ _id: "other", categoryTitle: "امتیازی " }),
  ];

  it("matches categories regardless of trailing spaces", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ category: "رانندگی" }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["trimmed", "trailing"]);
  });

  it("matches a selected category that itself has a trailing space", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ category: "امتیازی " }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["other"]);
  });
});

describe("filterGames score range and favorites", () => {
  const games = [
    makeGame({ _id: "low", score: 0 }),
    makeGame({ _id: "mid", score: 2.5 }),
    makeGame({ _id: "high", score: 4.9 }),
  ];

  it("treats both score range edges as inclusive", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ scoreRange: { min: 0, max: 2.5 } }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["low", "mid"]);
  });

  it("keeps only favorite ids when favoritesOnly is set", () => {
    const result = filterGames(
      games,
      makeBrowseFilter({ favoritesOnly: true }),
      new Set(["high", "unknown"]),
    );

    expect(ids(result)).toEqual(["high"]);
  });

  it("returns nothing for favoritesOnly with no favorites", () => {
    expect(
      filterGames(games, makeBrowseFilter({ favoritesOnly: true }), noFavorites),
    ).toEqual([]);
  });
});

describe("filterGames combined criteria", () => {
  const games = [
    makeGame({ _id: "a", title: "بازی ماشین", vendors: ["rubika"], score: 4 }),
    makeGame({ _id: "b", title: "بازی کیک", vendors: ["rubika"], score: 1 }),
    makeGame({ _id: "c", title: "بازی ماشین", vendors: [], score: 4 }),
  ];

  it("combines every criterion with AND", () => {
    const result = filterGames(
      games,
      makeSearchFilter("بازی", {
        vendors: ["rubika"],
        scoreRange: { min: 3, max: 5 },
      }),
      noFavorites,
    );

    expect(ids(result)).toEqual(["a"]);
  });

  it("keeps the original order and does not mutate the input", () => {
    const snapshot = [...games];
    const result = filterGames(games, makeBrowseFilter(), noFavorites);

    expect(ids(result)).toEqual(["a", "b", "c"]);
    expect(result).not.toBe(games);
    expect(games).toEqual(snapshot);
  });
});
