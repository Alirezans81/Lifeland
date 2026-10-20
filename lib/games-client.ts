import {
  parseGamesPage,
  type ParsedGamesPage,
  type ParseFailureReason,
} from "@/lib/parse-games";

export const GAMES_API_URL = "https://lifelands.ir/api/v1/games";

const REQUEST_TIMEOUT_MS = 10_000;

export type FetchGamesError =
  | { kind: "network" }
  | { kind: "upstream-status"; status: number }
  | { kind: "invalid-json" }
  | { kind: "invalid-payload"; reason: ParseFailureReason };

export type FetchGamesResult =
  | { ok: true; page: ParsedGamesPage }
  | { ok: false; error: FetchGamesError };

export type FetchGamesOptions = {
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export async function fetchGamesPage(
  pageId: number,
  options: FetchGamesOptions = {},
): Promise<FetchGamesResult> {
  const fetcher = options.fetcher ?? fetch;
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal =
    options.signal === undefined
      ? timeout
      : AbortSignal.any([options.signal, timeout]);
  const query = new URLSearchParams({ pageId: String(pageId) });

  let response: Response;
  try {
    response = await fetcher(`${GAMES_API_URL}?${query}`, { signal });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: { kind: "upstream-status", status: response.status },
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: { kind: "invalid-json" } };
  }

  const parsed = parseGamesPage(payload);
  if (!parsed.ok) {
    return {
      ok: false,
      error: { kind: "invalid-payload", reason: parsed.reason },
    };
  }
  return { ok: true, page: parsed.page };
}
