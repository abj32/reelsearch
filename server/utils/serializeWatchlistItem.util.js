export function serializeWatchlistItem(item) {
  const { imdbId, ...rest } = item;

  return {
    ...rest,
    imdbID: imdbId,
    boxOfficeValue:
      item.boxOfficeValue != null ? item.boxOfficeValue.toString() : null,
  };
}