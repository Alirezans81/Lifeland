import { qualityScore } from "@/lib/quality";
import type { Game } from "@/types/game";
import type { SortKey } from "@/types/sort";

type RankedGame = {
  game: Game;
  value: number;
};

function sortValue(game: Game, key: SortKey): number {
  return key === "quality" ? qualityScore(game) : game[key];
}

function compareRanked(first: RankedGame, second: RankedGame): number {
  if (first.value !== second.value) {
    return second.value - first.value;
  }
  if (first.game._id < second.game._id) {
    return -1;
  }
  return first.game._id > second.game._id ? 1 : 0;
}

export function sortGames(games: readonly Game[], key: SortKey): Game[] {
  return games
    .map((game) => ({ game, value: sortValue(game, key) }))
    .sort(compareRanked)
    .map((ranked) => ranked.game);
}
