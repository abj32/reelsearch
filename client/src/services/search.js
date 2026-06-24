import { request } from "./api";

export async function searchMovies(query) {
  const data = await request(`/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
  });
  
  return Array.isArray(data) ? data : [];
}