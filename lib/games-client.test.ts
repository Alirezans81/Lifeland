import { describe, expect, it } from "vitest";

import { fetchGamesPage, GAMES_API_URL } from "@/lib/games-client";

const validBody = {
  state: true,
  data: {
    pageId: 2,
    eachPerPage: 12,
    total: 729,
    games: [
      {
        _id: "g1",
        title: "Cube Away",
        companyName: "Lifelands",
        category: { title: "رانندگی " },
        vitrinThirdPartyVendors: ["rubika"],
        score: 4,
        rating: 1,
        like: 3,
        level: 1,
        runCount: 5,
        seenCount: 6,
        image: "game/a.webp",
        createdAtIso: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
};

type Recorded = { url: string; signal: AbortSignal | null | undefined };

function makeFetcher(
  respond: () => Response | Promise<Response>,
  recorded: Recorded[] = [],
): typeof fetch {
  return async (input, init) => {
    recorded.push({ url: String(input), signal: init?.signal });
    return respond();
  };
}

describe("fetchGamesPage", () => {
  it("requests the games endpoint with pageId and returns the page", async () => {
    const recorded: Recorded[] = [];
    const fetcher = makeFetcher(() => Response.json(validBody), recorded);

    const result = await fetchGamesPage(2, { fetcher });

    expect(recorded).toHaveLength(1);
    expect(recorded[0]?.url).toBe(`${GAMES_API_URL}?pageId=2`);
    expect(recorded[0]?.signal).toBeInstanceOf(AbortSignal);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.page.pageId).toBe(2);
      expect(result.page.games).toHaveLength(1);
      expect(result.page.games[0]?.categoryTitle).toBe("رانندگی");
    }
  });

  it("reports a non-2xx status", async () => {
    const fetcher = makeFetcher(() => new Response("boom", { status: 500 }));

    expect(await fetchGamesPage(1, { fetcher })).toEqual({
      ok: false,
      error: { kind: "upstream-status", status: 500 },
    });
  });

  it("reports a thrown fetch as a network error", async () => {
    const fetcher = makeFetcher(() => {
      throw new TypeError("fetch failed");
    });

    expect(await fetchGamesPage(1, { fetcher })).toEqual({
      ok: false,
      error: { kind: "network" },
    });
  });

  it("reports a body that is not JSON", async () => {
    const fetcher = makeFetcher(() => new Response("<html></html>"));

    expect(await fetchGamesPage(1, { fetcher })).toEqual({
      ok: false,
      error: { kind: "invalid-json" },
    });
  });

  it("reports valid JSON of the wrong shape", async () => {
    const fetcher = makeFetcher(() => Response.json({ state: false }));

    expect(await fetchGamesPage(1, { fetcher })).toEqual({
      ok: false,
      error: { kind: "invalid-payload", reason: "bad-envelope" },
    });
  });

  it("treats an already aborted signal as a network error", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher: typeof fetch = async (_input, init) => {
      init?.signal?.throwIfAborted();
      return Response.json(validBody);
    };

    expect(
      await fetchGamesPage(1, { fetcher, signal: controller.signal }),
    ).toEqual({ ok: false, error: { kind: "network" } });
  });
});
