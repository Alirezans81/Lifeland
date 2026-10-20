import type { Vendor } from "@/lib/vendor";
import type { SearchSortKey, SortKey } from "@/types/sort";

export type ScoreRange = {
  min: number;
  max: number;
};

type FilterCriteria = {
  vendors: readonly Vendor[];
  category: string | null;
  scoreRange: ScoreRange | null;
  favoritesOnly: boolean;
};

type BrowseFilter = {
  mode: "browse";
  query?: never;
  sort: SortKey;
};

type SearchFilter = {
  mode: "search";
  query: string;
  sort: SearchSortKey;
};

export type FilterState = FilterCriteria & (BrowseFilter | SearchFilter);
