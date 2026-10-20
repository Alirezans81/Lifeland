"use client";

import { useMemo } from "react";
import { EmptyResults } from "@/components/games/empty-results";
import { GameCard } from "@/components/games/game-card";
import { SearchInput } from "@/components/games/search-input";
import { useUrlState } from "@/hooks/use-url-state";
import { createExplorerFilter, exploreGames } from "@/lib/explore";
import { formatResultCount } from "@/lib/result-count";
import type { Game } from "@/types/game";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type GameExplorerProps = {
  games: Game[];
  pageId: number;
  total: number;
  eachPerPage: number;
};

const NO_FAVORITES: ReadonlySet<string> = new Set();

export function GameExplorer({
  games,
  pageId,
  total,
  eachPerPage,
}: GameExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / eachPerPage);

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());

    if (nextPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const [urlQuery, setUrlQuery] = useUrlState("q", "", {
    history: "replace",
  });

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

      <div className="w-full flex justify-between items-center">
        <div className="w-64 h-[37.6px] flex items-center">
          <p
            className="text-sm text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatResultCount(visibleGames.length)}
          </p>
        </div>

        {!urlQuery.trim() && totalPages > 1 && (
          <nav
            aria-label="صفحه‌بندی بازی‌ها"
            className="w-64 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              disabled={pageId <= 1}
              onClick={() => changePage(pageId - 1)}
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              قبلی
            </button>

            <span className="text-sm text-muted" aria-live="polite">
              صفحه {pageId} از {totalPages}
            </span>

            <button
              type="button"
              disabled={pageId >= totalPages}
              onClick={() => changePage(pageId + 1)}
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              بعدی
            </button>
          </nav>
        )}

        <div className="w-64" />
      </div>

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
