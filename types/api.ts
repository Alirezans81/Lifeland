export type ApiResponse<TData> = {
  state: boolean;
  data: TData;
};

export type ApiGame = {
  _id: string;
  title: string;
  companyName: string;
  category: { title: string };
  vitrinThirdPartyVendors?: string[];
  score: number;
  rating: number;
  like: number;
  level: number;
  runCount: number;
  seenCount: number;
  image: string;
  createdAtIso: string;
};

export type GamesPage = {
  pageId: number;
  eachPerPage: number;
  total: number;
  games: ApiGame[];
};

export type GamesResponse = ApiResponse<GamesPage>;
