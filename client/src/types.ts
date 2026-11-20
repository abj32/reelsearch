// Interim client shapes; #56 replaces Movie with the shared Zod TitleSchema.

export type Rating = { Source: string; Value: string };

// A search result or a watchlist item after normalizeMovie.
export type Movie = {
  imdbID: string;
  Title: string;
  Type: string | null;
  Poster: string | null;
  Rated: string | null;
  Year: string | null;
  Plot: string | null;
  Director: string | null;
  Actors: string | null;
  Ratings: Rating[];
  releaseYear?: number | null;
  imdbScore: number | null;
  rtScore: number | null;
  mcScore: number | null;
  sortScore: number | null;
  imdbRating?: string;
  Metascore?: string;
};

export type User = { id: number; email: string; createdAt: string };

export type WatchlistChatResponse = {
  action: { intent: "filter_watchlist" | "sort_watchlist" };
  items: Movie[];
};