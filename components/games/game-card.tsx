import Image from "next/image";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/image";
import type { Game } from "@/types/game";

type GameCardProps = {
  game: Game;
};

const numberFormatter = new Intl.NumberFormat("fa-IR");

const vendorLabels = {
  rubika: "روبیکا",
  soroush: "سروش",
} as const;

export function GameCard({ game }: GameCardProps) {
  const imageUrl = resolveImageUrl(game.image);

  return (
    <article
      className={cn(
        "col-span-1 group overflow-hidden rounded-md border border-border",
        "bg-surface transition-shadow hover:shadow-md",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            تصویری موجود نیست
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h2 className="line-clamp-1 text-base font-bold text-primary">
            {game.title}
          </h2>

          <p className="line-clamp-1 text-sm text-muted">
            {game.categoryTitle || "بدون دسته‌بندی"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
}
