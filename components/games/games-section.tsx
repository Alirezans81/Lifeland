import { getGamesPage } from "@/app/_data/get-games-page";
import { GameExplorer } from "@/components/games/game-explorer";

type GamesSectionProps = {
  pageId: number;
};

export async function GamesSection({ pageId }: GamesSectionProps) {
  const result = await getGamesPage(pageId);

  if (!result.ok) {
    return (
      <p className="rounded-md bg-surface p-6 text-center text-error">
        دریافت بازی‌ها با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید.
      </p>
    );
  }

  const { games, total, eachPerPage } = result.page;

  if (games.length === 0) {
    return (
      <p className="rounded-md bg-surface p-6 text-center text-muted">
        بازی‌ای در این صفحه پیدا نشد.
      </p>
    );
  }

  return (
    <GameExplorer
      games={games}
      pageId={result.page.pageId}
      total={total}
      eachPerPage={eachPerPage}
    />
  );
}
