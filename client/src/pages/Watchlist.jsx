import { useState } from "react";
import { removeFromWatchlist } from "../services/watchlist";
import MediaGrid from "../components/MediaGrid";

function getDeleteErrorMessage(err) {
  switch (err.code) {
    case "AUTH_REQUIRED":
      return "Please sign in to edit your watchlist.";

    case "AUTH_INVALID":
      return "Your session expired. Please sign in again.";

    case "WATCHLIST_DELETE_FAILED":
      return "Failed to remove title. Please try again.";

    default:
      return err.message || "Failed to remove title. Please try again.";
  }
}

export default function Watchlist({ watchlist, setWatchlist }) {
  const [error, setError] = useState("");

  async function handleDelete(item) {
    setError("");

    try {
      await removeFromWatchlist(item.imdbID);

      setWatchlist((prev) => prev.filter((m) => m.imdbID !== item.imdbID));
    } catch (err) {
      console.error("Failed to remove title:", err);

      if (err.code === "WATCHLIST_ITEM_NOT_FOUND") {
        setWatchlist((prev) => prev.filter((m) => m.imdbID !== item.imdbID));
        return;
      }

      setError(getDeleteErrorMessage(err));
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
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-foreground">
          {error}
        </div>
      )}

      <MediaGrid
        heading="Your watchlist"
        items={watchlist}
        mode="remove"
        onRemove={handleDelete}
        emptyMessage="No saved titles match these filters."
      />
    </div>
  );
}