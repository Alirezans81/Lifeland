import type { Game } from "@/types/game";

const SCORE_WEIGHT = 0.5;
const RATING_WEIGHT = 0.3;
const LIKE_WEIGHT = 0.2;

const SCORE_CAP = 5;
const RATING_CAP = 1.2;
const LIKE_CAP = 25;

function clampUnit(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.min(value, 1);
}

export function qualityScore(
  game: Pick<Game, "score" | "rating" | "like">,
): number {
  const scoreTerm = clampUnit(game.score / SCORE_CAP);
  const ratingTerm = clampUnit(game.rating / RATING_CAP);
  const likeTerm = clampUnit(
    Math.log1p(Math.max(game.like, 0)) / Math.log1p(LIKE_CAP),
  );

  return (
    SCORE_WEIGHT * scoreTerm +
    RATING_WEIGHT * ratingTerm +
    LIKE_WEIGHT * likeTerm
  );
}
