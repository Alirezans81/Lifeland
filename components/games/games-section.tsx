import { getGamesPage } from "@/app/_data/get-games-page";
import { GameCard } from "@/components/games/game-card";

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

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
}
