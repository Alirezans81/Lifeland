import { memo } from "react";
import { cn } from "@/lib/cn";
import { GameImage } from "@/components/games/game-image";
import type { Game } from "@/types/game";

type GameCardProps = {
  game: Game;
};

const numberFormatter = new Intl.NumberFormat("fa-IR");

const vendorLabels = {
  rubika: "روبیکا",
  soroush: "سروش",
} as const;

export const GameCard = memo(function GameCard({ game }: GameCardProps) {
  return (
    <article
      className={cn(
        "col-span-1 group overflow-hidden rounded-md border border-border",
        "bg-surface transition-shadow hover:shadow-md",
      )}
    >
      <GameImage path={game.image} title={game.title} />

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h2 className="line-clamp-1 text-base font-bold text-primary">
            {game.title}
          </h2>

          <p className="line-clamp-1 text-sm text-muted">
            {game.companyName || "سازنده نامشخص"}
          </p>
        </div>

        <div className="flex min-h-7 flex-wrap gap-2">
          {game.categoryTitle ? (
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {game.categoryTitle}
            </span>
          ) : null}

          {game.vendors.map((vendor) => (
            <span
              key={vendor}
              className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground"
            >
              {vendorLabels[vendor]}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div className="space-y-1">
            <p className="text-xs text-muted">امتیاز</p>
            <p className="font-semibold tabular-nums text-primary">
              {numberFormatter.format(game.score)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted">پسندها</p>
            <p className="font-semibold tabular-nums text-primary">
              {numberFormatter.format(game.like)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted">اجراها</p>
            <p className="font-semibold tabular-nums text-primary">
              {numberFormatter.format(game.runCount)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});
