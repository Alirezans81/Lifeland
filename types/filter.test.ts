import { describe, expect, expectTypeOf, it } from "vitest";

import type { FilterState } from "@/types/filter";
import type { SearchSortKey, SortKey } from "@/types/sort";

const baseCriteria = {
  vendors: [],
  category: null,
  scoreRange: null,
  favoritesOnly: false,
} as const;

describe("SortKey", () => {
  it("contains only numeric game fields plus quality", () => {
    expectTypeOf<SortKey>().toEqualTypeOf<
      "score" | "like" | "runCount" | "seenCount" | "quality"
    >();
  });

  it("adds relevance only for search", () => {
    expectTypeOf<SearchSortKey>().toEqualTypeOf<SortKey | "relevance">();
  });

  it("rejects non-numeric and unknown sort keys", () => {
    // @ts-expect-error title is a string field, not a numeric sort key
    const byTitle: SortKey = "title";
    // @ts-expect-error unknown keys are not sortable
    const byUnknown: SortKey = "popularity";
    // @ts-expect-error relevance is only valid together with a search query
    const byRelevance: SortKey = "relevance";

    expect([byTitle, byUnknown, byRelevance]).toHaveLength(3);
  });
});

describe("FilterState", () => {
  it("accepts browse mode without a query", () => {
    const state: FilterState = { ...baseCriteria, mode: "browse", sort: "score" };

    expect(state.mode).toBe("browse");
  });

  it("accepts search mode with a query and relevance sort", () => {
    const state: FilterState = {
      ...baseCriteria,
      mode: "search",
      query: "مسابقه",
      sort: "relevance",
    };

    expect(state.sort).toBe("relevance");
  });

  it("rejects relevance sort without a search query", () => {
    // @ts-expect-error relevance sort is incompatible with browse mode
    const state: FilterState = {
      ...baseCriteria,
      mode: "browse",
      sort: "relevance",
    };

    expect(state.mode).toBe("browse");
  });

  it("rejects a query in browse mode", () => {
    // @ts-expect-error browse mode cannot carry a search query
    const state: FilterState = {
      ...baseCriteria,
      mode: "browse",
      query: "مسابقه",
      sort: "score",
    };

    expect(state.mode).toBe("browse");
  });

  it("rejects search mode without a query", () => {
    // @ts-expect-error search mode requires a query
    const state: FilterState = { ...baseCriteria, mode: "search", sort: "score" };

    expect(state.mode).toBe("search");
  });

  it("rejects an invalid sort key", () => {
    const state: FilterState = {
      ...baseCriteria,
      mode: "search",
      query: "مسابقه",
      // @ts-expect-error title is not a sort key
      sort: "title",
    };

    expect(state.mode).toBe("search");
  });
});
