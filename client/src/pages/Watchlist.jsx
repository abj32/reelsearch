import { removeFromWatchlist } from "../services/watchlist";
import MediaGrid from "../components/MediaGrid";

export default function Watchlist({ watchlist, setWatchlist }) {
  async function handleDelete(item) {
    try {
      await removeFromWatchlist(item.imdbID);
      setWatchlist((prev) => prev.filter((m) => m.imdbID !== item.imdbID));
    } catch (err) {
      console.error("Failed to remove title", err);
    }
  }

  if (watchlist.length === 0) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-2 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-foreground">Your watchlist is empty</h2>
        <p className="mt-3 max-w-md text-pretty text-muted">
          Search for movies, series, or games and tap the plus icon to start
          collecting titles here.
        </p>
      </section>
    );
  }

  return (
    <MediaGrid
      heading="Your watchlist"
      items={watchlist}
      mode="remove"
      onRemove={handleDelete}
      emptyMessage="No saved titles match these filters."
    />
  );
}