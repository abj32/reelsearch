export function serializeWatchlistItem(item) {
  return {
    ...item,
    boxOfficeValue:
      item.boxOfficeValue != null ? item.boxOfficeValue.toString() : null,
  };
}