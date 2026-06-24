import { normalizeRatings } from './ratings.util.js';

function naToNull(val) {
  if (!val || val === 'N/A' || val === 'Not Rated') return null;
  return val;
}

/**
 * Normalizes a raw OMDb detail object (as returned by getMovieDetails)
 * into the same shape as a serialized watchlist item.
 *
 * Both shapes expose:
 *   - Ratings array  → getCriticScores() in mediaHelpers.js
 *   - sortScore      → getStarRating() in mediaHelpers.js
 */
export function normalizeSearchResult(movie) {
  const { imdbRaw, rtRaw, mcRaw, imdbScore, rtScore, mcScore, sortScore } =
    normalizeRatings(Array.isArray(movie.Ratings) ? movie.Ratings : []);

  // Reconstruct Ratings array so getCriticScores() resolves the same way
  // it does for watchlist items (which go through normalizeMovie on the frontend).
  const Ratings = [];
  if (imdbRaw) Ratings.push({ Source: 'Internet Movie Database', Value: imdbRaw });
  if (rtRaw)   Ratings.push({ Source: 'Rotten Tomatoes',         Value: rtRaw   });
  if (mcRaw)   Ratings.push({ Source: 'Metacritic',              Value: mcRaw   });

  return {
    imdbID:   movie.imdbID,
    Title:    movie.Title,
    Type:     naToNull(movie.Type),
    Poster:   naToNull(movie.Poster),
    Rated:    naToNull(movie.Rated),
    Year:     naToNull(movie.Year),
    Plot:     naToNull(movie.Plot),
    Director: naToNull(movie.Director),
    Actors:   naToNull(movie.Actors),
    Genre:    naToNull(movie.Genre),
    Ratings,
    imdbScore,
    rtScore,
    mcScore,
    sortScore,
  };
}