const API_KEY = process.env.API_KEY;
const BASE_URL = "https://www.omdbapi.com/";

async function fetchOmdb(params) {
  const url = new URL(BASE_URL);

  url.searchParams.set("apikey", API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`OMDb request failed with status ${res.status}`);
  }

  return res.json();
}

// Get list of movies/shows with title similar to given query
async function getMovies(query) {
  return fetchOmdb({ s: query });
}

// Get details of given movie/show id
export async function getMovieDetails(id) {
  const data = await fetchOmdb({ i: id });

  if (data?.Response === "False") {
    throw new Error(data.Error || `OMDb returned no details for id ${id}`);
  }

  return data;
}

// Combined list and detailed search used by SearchBar
export async function combinedSearch(query) {
  const base = await getMovies(query);

  // "Movie not found!" is a valid no-results case for search
  if (base?.Response === "False") {
    if (base.Error === "Movie not found!") {
      return [];
    }

    if (base.Error === "Too many results.") {
      const err = new Error("Too many results");
      err.code = "TOO_MANY_RESULTS";
      throw err;
    }

    throw new Error(base.Error || "OMDb search failed");
  }

  if (!Array.isArray(base.Search)) {
    return [];
  }

  // Filter out duplicate movies/shows
  const seen = new Set();
  const unique = base.Search.filter((movie) => {
    if (!movie?.imdbID || seen.has(movie.imdbID)) {
      return false;
    }

    seen.add(movie.imdbID);
    return true;
  });

  // Allow partial success if one detail request fails
  const detailedResults = await Promise.allSettled(
    unique.map((movie) => getMovieDetails(movie.imdbID))
  );

  return detailedResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}