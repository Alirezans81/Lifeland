"use client";

import { useMemo } from "react";
import { EmptyResults } from "@/components/games/empty-results";
import { GameCard } from "@/components/games/game-card";
import { SearchInput } from "@/components/games/search-input";
import { useUrlState } from "@/hooks/use-url-state";
import { createExplorerFilter, exploreGames } from "@/lib/explore";
import { formatResultCount } from "@/lib/result-count";
import type { Game } from "@/types/game";

type GameExplorerProps = {
  games: Game[];
};

const NO_FAVORITES: ReadonlySet<string> = new Set();

export function GameExplorer({ games }: GameExplorerProps) {
  const [urlQuery, setUrlQuery] = useUrlState("q", "", { history: "replace" });

  const visibleGames = useMemo(
    () => exploreGames(games, createExplorerFilter(urlQuery), NO_FAVORITES),
    [games, urlQuery],
  );

  function resetSearch() {
    setUrlQuery("");
  }

  return (
    <section className="space-y-6">
      <SearchInput initialQuery={urlQuery} onCommit={setUrlQuery} />

      <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">
        {formatResultCount(visibleGames.length)}
      </p>

      {visibleGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleGames.map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      ) : (
        <EmptyResults onReset={resetSearch} />
      )}
    </section>
  );
}
