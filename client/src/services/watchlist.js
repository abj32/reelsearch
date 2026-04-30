import { request } from "./api";
import { normalizeMovie } from "../utils/normalizeMovie"

export async function fetchWatchlist() {
  const movies = await request("/watchlist", {
    method: "GET",
    useGlobalLoading: true,
  });
  return movies.map(normalizeMovie);
}

export async function addToWatchlist(imdbID) {
  const movie = await request("/watchlist", {
    method: "POST",
    body: JSON.stringify({ imdbId: imdbID }),
  });
  return normalizeMovie(movie);
}

export async function removeFromWatchlist(imdbID) {
  await request(`/watchlist/${encodeURIComponent(imdbID)}`, {
    method: "DELETE",
  });
}