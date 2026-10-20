import { getGamesPage } from "@/app/_data/get-games-page";
import { GameExplorer } from "@/components/games/game-explorer";

export async function GamesSection() {
  const result = await getGamesPage(1);

  if (!result.ok) {
    return (
      <p className="rounded-md bg-surface p-6 text-center text-error">
        دریافت بازی‌ها با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید.
      </p>
    );
  }

  const games = result.page.games.slice(0, 12);

  if (games.length === 0) {
    return (
      <p className="rounded-md bg-surface p-6 text-center text-muted">
        هنوز بازی‌ای برای نمایش وجود ندارد.
      </p>
    );
  }

  return <GameExplorer games={games} />;
}
