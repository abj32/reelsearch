// Shared helpers for working with normalized search results and watchlist items.
// Both shapes now carry sortScore (composite 0-100) and a Ratings array.

export const TYPE_META = {
  movie:  { label: "Movie",  short: "Film"   },
  series: { label: "Series", short: "Series" },
  game:   { label: "Game",   short: "Game"   },
};

export function getTypeMeta(type) {
  return TYPE_META[type] || { label: "Title", short: "Title" };
}

function findRating(item, source) {
  if (!Array.isArray(item?.Ratings)) return null;
  const match = item.Ratings.find((r) => r.Source === source);
  return match ? match.Value : null;
}

// Returns the composite average rating as a number out of 10 (or null if unavailable).
// sortScore is 0-100; dividing by 10 gives the familiar display format.
export function getStarRating(item) {
  if (item == null) return null;

  if (typeof item.sortScore === 'number' && !Number.isNaN(item.sortScore)) {
    return item.sortScore / 10;
  }

  return null; // no ratings data — badge will not render
}

// Returns display strings for the three critic scores.
export function getCriticScores(item) {
  const imdb =
    findRating(item, "Internet Movie Database") ||
    (item?.imdbRating && item.imdbRating !== "N/A" ? `${item.imdbRating}/10` : null) ||
    (typeof item?.imdbScore === "number" ? `${item.imdbScore}/10` : null);

  const rt =
    findRating(item, "Rotten Tomatoes") ||
    (typeof item?.rtScore === "number" ? `${item.rtScore}%` : null);

  const mc =
    findRating(item, "Metacritic") ||
    (item?.Metascore && item.Metascore !== "N/A" ? `${item.Metascore}/100` : null) ||
    (typeof item?.mcScore === "number" ? `${item.mcScore}/100` : null);

  return {
    imdb: imdb || "N/A",
    rt:   rt   || "N/A",
    mc:   mc   || "N/A",
  };
}

export function getYearValue(item) {
  if (typeof item?.releaseYear === "number") return item.releaseYear;
  const parsed = parseInt(String(item?.Year || ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const SORT_OPTIONS   = ["Relevance", "Rating", "Title", "Year"];
export const FILTER_OPTIONS = ["All", "Movies", "Series", "Games"];

const FILTER_TO_TYPE = {
  Movies: "movie",
  Series: "series",
  Games:  "game",
};

export function applyFilter(items, filter) {
  if (filter === "All" || !FILTER_TO_TYPE[filter]) return items;
  return items.filter((item) => item.Type === FILTER_TO_TYPE[filter]);
}

export function applySort(items, sort) {
  const copy = [...items];
  switch (sort) {
    case "Rating":
      return copy.sort((a, b) => (getStarRating(b) ?? -1) - (getStarRating(a) ?? -1));
    case "Title":
      return copy.sort((a, b) =>
        String(a.Title || "").localeCompare(String(b.Title || ""))
      );
    case "Year":
      return copy.sort((a, b) => getYearValue(b) - getYearValue(a));
    case "Relevance":
    default:
      return copy;
  }
}

export function getPoster(item) {
  if (item?.Poster && item.Poster !== "N/A") return item.Poster;
  return null;
}