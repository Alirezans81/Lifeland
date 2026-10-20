import { isVendor, type Vendor } from "@/lib/vendor";
import type { Game } from "@/types/game";

export type ParsedGamesPage = {
  games: Game[];
  pageId: number;
  total: number;
  eachPerPage: number;
  receivedCount: number;
};

export type ParseFailureReason = "bad-envelope" | "bad-page";

export type ParseResult =
  | { ok: true; page: ParsedGamesPage }
  | { ok: false; reason: ParseFailureReason };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: UnknownRecord, key: string): string | null {
  const value = source[key];
  return typeof value === "string" ? value : null;
}

function readNumber(source: UnknownRecord, key: string): number | null {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readCategoryTitle(item: UnknownRecord): string {
  const category = item.category;
  if (!isRecord(category)) {
    return "";
  }
  return (readString(category, "title") ?? "").trim();
}

function readVendors(item: UnknownRecord): Vendor[] {
  const raw = item.vitrinThirdPartyVendors;
  if (!Array.isArray(raw)) {
    return [];
  }
  const entries: readonly unknown[] = raw;
  const vendors: Vendor[] = [];
  for (const entry of entries) {
    if (
      typeof entry === "string" &&
      isVendor(entry) &&
      !vendors.includes(entry)
    ) {
      vendors.push(entry);
    }
  }
  return vendors;
}

function toGame(item: unknown): Game | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = readString(item, "_id");
  const title = readString(item, "title")?.trim() ?? "";
  const score = readNumber(item, "score");
  const rating = readNumber(item, "rating");
  const like = readNumber(item, "like");
  const level = readNumber(item, "level");
  const runCount = readNumber(item, "runCount");
  const seenCount = readNumber(item, "seenCount");

  if (
    id === null ||
    id === "" ||
    title === "" ||
    score === null ||
    rating === null ||
    like === null ||
    level === null ||
    runCount === null ||
    seenCount === null
  ) {
    return null;
  }

  return {
    _id: id,
    title,
    companyName: (readString(item, "companyName") ?? "").trim(),
    score,
    rating,
    like,
    level,
    runCount,
    seenCount,
    image: readString(item, "image") ?? "",
    createdAtIso: readString(item, "createdAtIso") ?? "",
    categoryTitle: readCategoryTitle(item),
    vendors: readVendors(item),
  };
}

export function parseGamesPage(payload: unknown): ParseResult {
  if (!isRecord(payload) || payload.state !== true) {
    return { ok: false, reason: "bad-envelope" };
  }
  const data = payload.data;
  if (!isRecord(data)) {
    return { ok: false, reason: "bad-envelope" };
  }

  const pageId = readNumber(data, "pageId");
  const eachPerPage = readNumber(data, "eachPerPage");
  const total = readNumber(data, "total");
  const rawGames = data.games;
  if (
    pageId === null ||
    eachPerPage === null ||
    total === null ||
    !Array.isArray(rawGames)
  ) {
    return { ok: false, reason: "bad-page" };
  }

  const items: readonly unknown[] = rawGames;
  const games: Game[] = [];
  for (const item of items) {
    const game = toGame(item);
    if (game !== null) {
      games.push(game);
    }
  }

  return {
    ok: true,
    page: { games, pageId, total, eachPerPage, receivedCount: items.length },
  };
}
