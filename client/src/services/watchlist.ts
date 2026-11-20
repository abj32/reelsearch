import { request } from "./api";
import { normalizeMovie } from "../utils/normalizeMovie"
import type { Movie } from "../types";

export async function fetchWatchlist(): Promise<Movie[]> {
  const movies = await request<unknown[]>("/watchlist", {
    method: "GET",
    useGlobalLoading: true,
  });
  return movies.map(normalizeMovie);
}

export async function addToWatchlist(imdbID: string): Promise<Movie> {
  const movie = await request("/watchlist", {
    method: "POST",
    body: JSON.stringify({ imdbId: imdbID }),
  });
  return normalizeMovie(movie);
}

export async function removeFromWatchlist(imdbID: string) {
  await request(`/watchlist/${encodeURIComponent(imdbID)}`, {
    method: "DELETE",
  });
}