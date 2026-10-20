import { describe, expect, it } from "vitest";

import { parseGamesPage } from "@/lib/parse-games";

type RawItem = Record<string, unknown>;

function makeRawGame(overrides: RawItem = {}): RawItem {
  return {
    _id: "g1",
    title: "Cube Away",
    companyName: "Lifelands",
    category: { title: "رانندگی " },
    vitrinThirdPartyVendors: ["rubika", "soroush"],
    score: 4.5,
    rating: 1.1,
    like: 12,
    level: 2,
    runCount: 100,
    seenCount: 200,
    image: "game/file-1.webp",
    createdAtIso: "2026-01-01T00:00:00.000Z",
    creator: { name: "Private Person", phone: "09120000000" },
    reviewHistory: [{ note: "internal" }],
    ...overrides,
  };
}

function makePayload(games: unknown[], dataOverrides: RawItem = {}): unknown {
  return {
    state: true,
    data: { pageId: 1, eachPerPage: 12, total: 729, games, ...dataOverrides },
  };
}

function parseOk(payload: unknown) {
  const result = parseGamesPage(payload);
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.reason}`);
  }
  return result.page;
}

describe("parseGamesPage", () => {
  it("maps a clean page and carries the page meta", () => {
    const page = parseOk(makePayload([makeRawGame()]));

    expect(page).toEqual({
      games: [
        {
          _id: "g1",
          title: "Cube Away",
          companyName: "Lifelands",
          score: 4.5,
          rating: 1.1,
          like: 12,
          level: 2,
          runCount: 100,
          seenCount: 200,
          image: "game/file-1.webp",
          createdAtIso: "2026-01-01T00:00:00.000Z",
          categoryTitle: "رانندگی",
          vendors: ["rubika", "soroush"],
        },
      ],
      pageId: 1,
      eachPerPage: 12,
      total: 729,
      receivedCount: 1,
    });
  });

  it("maps empty and missing vendors to an empty array", () => {
    const page = parseOk(
      makePayload([
        makeRawGame({ _id: "a", vitrinThirdPartyVendors: [] }),
        makeRawGame({ _id: "b", vitrinThirdPartyVendors: undefined }),
        makeRawGame({ _id: "c", vitrinThirdPartyVendors: "rubika" }),
      ]),
    );

    expect(page.games.map((game) => game.vendors)).toEqual([[], [], []]);
  });

  it("drops unknown vendors and repeated vendors", () => {
    const page = parseOk(
      makePayload([
        makeRawGame({
          vitrinThirdPartyVendors: ["rubika", "bale", 5, "rubika"],
        }),
      ]),
    );

    expect(page.games[0]?.vendors).toEqual(["rubika"]);
  });

  it("trims the category title and tolerates a missing category", () => {
    const page = parseOk(
      makePayload([
        makeRawGame({ _id: "a", category: { title: "  امتیازی " } }),
        makeRawGame({ _id: "b", category: undefined }),
        makeRawGame({ _id: "c", category: { title: 3 } }),
      ]),
    );

    expect(page.games.map((game) => game.categoryTitle)).toEqual([
      "امتیازی",
      "",
      "",
    ]);
  });

  it("keeps an empty companyName and defaults a missing one", () => {
    const page = parseOk(
      makePayload([
        makeRawGame({ _id: "a", companyName: "" }),
        makeRawGame({ _id: "b", companyName: undefined }),
      ]),
    );

    expect(page.games.map((game) => game.companyName)).toEqual(["", ""]);
  });

  it("never forwards creator or other upstream fields", () => {
    const page = parseOk(makePayload([makeRawGame()]));
    const game = page.games[0];

    expect(game).toBeDefined();
    expect(game).not.toHaveProperty("creator");
    expect(game).not.toHaveProperty("reviewHistory");
    expect(JSON.stringify(page)).not.toContain("Private Person");
  });

  it("drops malformed items and reports the raw received count", () => {
    const page = parseOk(
      makePayload([
        makeRawGame({ _id: "ok-1" }),
        makeRawGame({ _id: undefined }),
        makeRawGame({ _id: "" }),
        makeRawGame({ _id: "bad-score", score: "4" }),
        makeRawGame({ _id: "nan-like", like: Number.NaN }),
        makeRawGame({ _id: "blank-title", title: "   " }),
        null,
        "text",
        makeRawGame({ _id: "ok-2" }),
      ]),
    );

    expect(page.games.map((game) => game._id)).toEqual(["ok-1", "ok-2"]);
    expect(page.receivedCount).toBe(9);
  });

  it("accepts an empty games array", () => {
    const page = parseOk(makePayload([], { pageId: 100 }));

    expect(page.games).toEqual([]);
    expect(page.receivedCount).toBe(0);
    expect(page.pageId).toBe(100);
  });

  it("rejects a bad envelope", () => {
    expect(parseGamesPage({ state: false, data: {} })).toEqual({
      ok: false,
      reason: "bad-envelope",
    });
    expect(parseGamesPage(null)).toEqual({ ok: false, reason: "bad-envelope" });
    expect(parseGamesPage("text")).toEqual({
      ok: false,
      reason: "bad-envelope",
    });
    expect(parseGamesPage([])).toEqual({ ok: false, reason: "bad-envelope" });
    expect(parseGamesPage({ state: true })).toEqual({
      ok: false,
      reason: "bad-envelope",
    });
    expect(parseGamesPage({ state: true, data: [] })).toEqual({
      ok: false,
      reason: "bad-envelope",
    });
  });

  it("rejects a bad page", () => {
    expect(parseGamesPage({ state: true, data: { pageId: 1 } })).toEqual({
      ok: false,
      reason: "bad-page",
    });
    expect(parseGamesPage(makePayload([], { games: "none" }))).toEqual({
      ok: false,
      reason: "bad-page",
    });
    expect(parseGamesPage(makePayload([], { total: "729" }))).toEqual({
      ok: false,
      reason: "bad-page",
    });
    expect(parseGamesPage(makePayload([], { eachPerPage: null }))).toEqual({
      ok: false,
      reason: "bad-page",
    });
  });
});
