export function serializeWatchlistItem(item) {
  return {
    ...item,
    imdbID: item.imdbId,
    boxOfficeValue:
      item.boxOfficeValue != null ? item.boxOfficeValue.toString() : null,
  };
}