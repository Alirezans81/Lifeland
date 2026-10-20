import type { NextRequest } from "next/server";

import { getGamesPage } from "@/app/_data/get-games-page";
import type { FetchGamesError } from "@/lib/games-client";
import { parsePageIdParam } from "@/lib/page-id";

type ErrorCode =
  | "invalid-page-id"
  | "upstream-unavailable"
  | "invalid-upstream-payload";

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
): Response {
  return Response.json({ error: { code, message } }, { status });
}

function upstreamErrorResponse(error: FetchGamesError): Response {
  if (error.kind === "invalid-json" || error.kind === "invalid-payload") {
    return errorResponse(
      502,
      "invalid-upstream-payload",
      "The games service returned an unexpected response.",
    );
  }
  return errorResponse(
    502,
    "upstream-unavailable",
    "The games service is unavailable.",
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  const pageId = parsePageIdParam(request.nextUrl.searchParams.get("pageId"));
  if (pageId === null) {
    return errorResponse(
      400,
      "invalid-page-id",
      "pageId must be a positive integer.",
    );
  }

  const result = await getGamesPage(pageId);
  if (!result.ok) {
    return upstreamErrorResponse(result.error);
  }
  return Response.json(result.page);
}
