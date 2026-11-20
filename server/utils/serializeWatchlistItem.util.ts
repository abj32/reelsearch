import type { WatchlistItem } from '../../generated/prisma/client.js';

export function serializeWatchlistItem(item: WatchlistItem) {
  return {
    ...item,
    imdbID: item.imdbId,
    boxOfficeValue:
      item.boxOfficeValue != null ? item.boxOfficeValue.toString() : null,
  };
}