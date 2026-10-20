"use client";

import { useEffect, useMemo, useState } from "react";
import { GameCard } from "@/components/games/game-card";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlState } from "@/hooks/use-url-state";
import { filterGames } from "@/lib/filter";
import { sortGames } from "@/lib/sort";
import type { FilterState } from "@/types/filter";
import type { Game } from "@/types/game";

type GameExplorerProps = {
  games: Game[];
};

type SearchInputProps = {
  initialQuery: string;
  onCommit: (value: string) => void;
};

function SearchInput({ initialQuery, onCommit }: SearchInputProps) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [lastCommittedQuery, setLastCommittedQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(draftQuery, 500);

  if (initialQuery !== lastCommittedQuery) {
    setLastCommittedQuery(initialQuery);
    setDraftQuery(initialQuery);
  }

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      onCommit(debouncedQuery);
    }
  }, [debouncedQuery, initialQuery, onCommit]);

  return (
    <div className="space-y-2">
      <label
        htmlFor="game-search"
        className="block text-sm font-medium text-primary"
      >
        جست‌وجوی بازی
      </label>

      <input
        id="game-search"
        type="search"
        value={draftQuery}
        onChange={(event) => setDraftQuery(event.target.value)}
        placeholder="نام بازی یا شرکت سازنده..."
        autoComplete="off"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 text-primary outline-none transition focus:border-accent"
      />
    </div>
  );
}

export function GameExplorer({ games }: GameExplorerProps) {
  const [urlQuery, setUrlQuery] = useUrlState("q", "");
  const query = urlQuery.trim();

  const filteredGames = useMemo(() => {
    const criteria = {
      vendors: [],
      category: null,
      scoreRange: null,
      favoritesOnly: false,
    };

    const filter: FilterState = query
      ? {
          ...criteria,
          mode: "search",
          query,
          sort: "relevance",
        }
      : {
          ...criteria,
          mode: "browse",
          sort: "score",
        };

    return filterGames(games, filter, new Set<string>());
  }, [games, query]);

  const visibleGames = useMemo(
    () => (query ? filteredGames : sortGames(filteredGames, "score")),
    [filteredGames, query],
  );

  function resetSearch() {
    setUrlQuery("");
  }

  return (
    <section className="space-y-6">
      <SearchInput initialQuery={urlQuery} onCommit={setUrlQuery} />

      <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">
        {visibleGames.length.toLocaleString("fa-IR")} بازی پیدا شد
      </p>

      {visibleGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleGames.map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-md bg-surface p-6 text-center">
          <p className="text-primary">بازی‌ای با این عبارت پیدا نشد.</p>

          <button
            type="button"
            onClick={resetSearch}
            className="rounded-md bg-accent px-4 py-2 text-sm text-accent-foreground transition hover:opacity-90"
          >
            پاک کردن جست‌وجو
          </button>
        </div>
      )}
    </section>
  );
}
