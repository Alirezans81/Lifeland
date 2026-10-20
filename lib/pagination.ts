import type { Game } from "@/types/game";

export type PageMeta = {
  pageId: number;
  eachPerPage: number;
  total: number;
  receivedCount: number;
};

export type PageMismatch =
  | "none"
  | "empty"
  | "short"
  | "long"
  | "total-exceeded";

function isPositiveCount(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function getNextPageId(
  page: PageMeta,
  loadedCount: number,
): number | null {
  if (page.receivedCount <= 0) {
    return null;
  }
  if (isPositiveCount(page.eachPerPage) && page.receivedCount < page.eachPerPage) {
    return null;
  }
  if (isPositiveCount(page.total) && loadedCount >= page.total) {
    return null;
  }
  return page.pageId + 1;
}

export function describePageMismatch(page: PageMeta): PageMismatch {
  const hasPerPage = isPositiveCount(page.eachPerPage);
  const hasTotal = hasPerPage && isPositiveCount(page.total);
  const pageCount = hasTotal ? Math.ceil(page.total / page.eachPerPage) : null;

  if (pageCount !== null && page.pageId > pageCount) {
    return page.receivedCount > 0 ? "total-exceeded" : "none";
  }
  if (hasPerPage && page.receivedCount > page.eachPerPage) {
    return "long";
  }
  if (page.receivedCount === 0) {
    return "empty";
  }
  if (
    pageCount !== null &&
    page.pageId < pageCount &&
    page.receivedCount < page.eachPerPage
  ) {
    return "short";
  }
  return "none";
}

export function mergeGames(
  existing: readonly Game[],
  incoming: readonly Game[],
): Game[] {
  const seen = new Set<string>();
  const merged: Game[] = [];

  for (const game of [...existing, ...incoming]) {
    if (!seen.has(game._id)) {
      seen.add(game._id);
      merged.push(game);
    }
  }
  return merged;
}
