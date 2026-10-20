import { cacheLife } from "next/cache";

import { fetchGamesPage, type FetchGamesResult } from "@/lib/games-client";

export async function getGamesPage(pageId: number): Promise<FetchGamesResult> {
  "use cache";

  const result = await fetchGamesPage(pageId);
  if (result.ok) {
    cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  } else {
    cacheLife("seconds");
  }
  return result;
}
