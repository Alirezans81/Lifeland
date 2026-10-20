import type { Game } from "@/types/game";

type NumericKey<TItem> = {
  [Key in keyof TItem]-?: TItem[Key] extends number ? Key : never;
}[keyof TItem];

type UnsortableNumericField = "level" | "rating";

export type SortKey =
  | Exclude<NumericKey<Game>, UnsortableNumericField>
  | "quality";

export type SearchSortKey = SortKey | "relevance";
