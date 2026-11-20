import { request } from "./api";
import type { Movie } from "../types";

export async function searchMovies(query: string) {
  const data = await request(`/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
  });
  
  return Array.isArray(data) ? (data as Movie[]) : [];
}
