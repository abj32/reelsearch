export type OmdbRating = { Source: string; Value: string };

export function normalizeRatings(ratings: OmdbRating[]) {
  const map = Object.fromEntries(ratings.map(r => [r.Source, r.Value]));

  // Raw strings to store for display
  const imdbRaw = map['Internet Movie Database'] ?? null; // "8.7/10"
  const rtRaw   = map['Rotten Tomatoes'] ?? null;         // "95%"
  const mcRaw   = map['Metacritic'] ?? null;              // "82/100"

  // IMDB
  let imdbScore: number | null = null;
  if (imdbRaw) {
    const num = parseFloat(imdbRaw.split("/")[0]);
    imdbScore = num * 10;
  }

  // Rotten Tomatoes
  let rtScore: number | null = null;
  if (rtRaw) {
    rtScore = parseInt(rtRaw.replace("%", ""));
  }

  // Metacritic
  let mcScore: number | null = null;
  if (mcRaw) {
    mcScore = parseInt(mcRaw.split("/")[0]);
  }

  // Average of present scores only
  const present = [imdbScore, rtScore, mcScore].filter(v => v != null);
  const sortScore = present.length
    ? Math.round((present.reduce((a, b) => a + b, 0) / present.length) * 100) / 100
    : null;

  return {
    imdbRaw,
    rtRaw,
    mcRaw,
    imdbScore,
    rtScore,
    mcScore,
    sortScore,
  };
}