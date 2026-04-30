export function normalizeMovie(movie) {
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
    // Identity
    imdbID: movie.imdbId,

    // Core metadata
    Title: movie.title,
    Type: movie.type,
    Poster: movie.poster,
    Rated: movie.rated,

    // Raw OMDb fields
    Year: movie.year,
    Genre: movie.genre,
    Runtime: movie.runtime,
    Language: movie.language,
    BoxOffice: movie.boxOffice,

    // Parsed / query fields
    releaseYear: movie.releaseYear,
    genres: movie.genres,
    runtimeMins: movie.runtimeMins,
    languages: movie.languages,
    boxOfficeValue: movie.boxOfficeValue,

    // Descriptive metadata
    Plot: movie.plot,
    Director: movie.director,
    Actors: movie.actors,

    // Raw ratings reconstructed for existing UI
    Ratings: ratings,

    // Normalized ratings
    imdbScore: movie.imdbScore,
    rtScore: movie.rtScore,
    mcScore: movie.mcScore,
    sortScore: movie.sortScore,

    // Timestamp
    createdAt: movie.createdAt,
  };
}