import { normalizePersian } from "@/lib/normalize";
import type { FilterState } from "@/types/filter";
import type { Game } from "@/types/game";

function matchesQuery(game: Game, tokens: readonly string[]): boolean {
  if (tokens.length === 0) {
    return true;
  }
  const haystack = normalizePersian(`${game.title} ${game.companyName}`);
  return tokens.every((token) => haystack.includes(token));
}

function matchesVendors(game: Game, filter: FilterState): boolean {
  if (filter.vendors.length === 0) {
    return true;
  }
  return game.vendors.some((vendor) => filter.vendors.includes(vendor));
}

function matchesCategory(game: Game, category: string | null): boolean {
  if (category === null) {
    return true;
  }
  return normalizePersian(game.categoryTitle) === category;
}

function matchesScoreRange(game: Game, filter: FilterState): boolean {
  if (filter.scoreRange === null) {
    return true;
  }
  return (
    game.score >= filter.scoreRange.min && game.score <= filter.scoreRange.max
  );
}

function toQueryTokens(filter: FilterState): string[] {
  if (filter.mode !== "search") {
    return [];
  }
  const normalized = normalizePersian(filter.query);
  return normalized === "" ? [] : normalized.split(" ");
}

export function filterGames(
  games: readonly Game[],
  filter: FilterState,
  favoriteIds: ReadonlySet<string>,
): Game[] {
  const tokens = toQueryTokens(filter);
  const category =
    filter.category === null ? null : normalizePersian(filter.category);

  return games.filter(
    (game) =>
      matchesQuery(game, tokens) &&
      matchesVendors(game, filter) &&
      matchesCategory(game, category) &&
      matchesScoreRange(game, filter) &&
      (!filter.favoritesOnly || favoriteIds.has(game._id)),
  );
}
