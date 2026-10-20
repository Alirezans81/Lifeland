import { filterGames } from "@/lib/filter";
import { sortGames } from "@/lib/sort";
import type { FilterState } from "@/types/filter";
import type { Game } from "@/types/game";

const DEFAULT_CRITERIA = {
  vendors: [],
  category: null,
  scoreRange: null,
  favoritesOnly: false,
} as const;

export function createExplorerFilter(query: string): FilterState {
  const trimmedQuery = query.trim();

  return trimmedQuery
    ? {
        ...DEFAULT_CRITERIA,
        mode: "search",
        query: trimmedQuery,
        sort: "relevance",
      }
    : {
        ...DEFAULT_CRITERIA,
        mode: "browse",
        sort: "score",
      };
}

export function exploreGames(
  games: readonly Game[],
  filter: FilterState,
  favoriteIds: ReadonlySet<string>,
): Game[] {
  const filtered = filterGames(games, filter, favoriteIds);

  return filter.mode === "browse" ? sortGames(filtered, filter.sort) : filtered;
}
