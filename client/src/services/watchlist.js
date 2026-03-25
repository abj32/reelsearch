import { request } from "./api";

function normalizeMovie(movie) {
  // Build a Ratings array from raw strings
  const ratings = [];
  if (movie.imdbRaw) {
    ratings.push({
      Source: "Internet Movie Database",
      Value: movie.imdbRaw,
    });
  }
  if (movie.rtRaw) {
    ratings.push({
      Source: "Rotten Tomatoes",
      Value: movie.rtRaw,
    });
  }
  if (movie.mcRaw) {
    ratings.push({
      Source: "Metacritic",
      Value: movie.mcRaw,
    });
  }

  return {
    imdbID: movie.imdbId,
    Title: movie.title,
    Poster: movie.poster,
    Year: movie.year,
    Type: movie.type,
    Rated: movie.rated,
    Genre: movie.genre,
    Plot: movie.plot,
    Director: movie.director,
    Actors: movie.actors,

    Ratings: ratings,
    imdbScore: movie.imdbScore,
    rtScore: movie.rtScore,
    mcScore: movie.mcScore,
    sortScore: movie.sortScore,
  };
}

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