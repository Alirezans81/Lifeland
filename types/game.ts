import type { Vendor } from "@/lib/vendor";
import type { ApiGame } from "@/types/api";

export type Game = Pick<
  ApiGame,
  | "_id"
  | "title"
  | "companyName"
  | "score"
  | "rating"
  | "like"
  | "level"
  | "runCount"
  | "seenCount"
  | "image"
  | "createdAtIso"
> & {
  categoryTitle: string;
  vendors: readonly Vendor[];
};
