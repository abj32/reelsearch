import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "../services/watchlist";
import MediaGrid from "../components/MediaGrid";

function getWatchlistActionErrorMessage(err, action) {
  if (err.code === "AUTH_REQUIRED" || err.code === "AUTH_INVALID") {
    return "Please log in to manage your watchlist.";
  }

  if (action === "add") {
    switch (err.code) {
      case "WATCHLIST_ITEM_EXISTS":
        return "This title is already in your watchlist.";

      case "INVALID_IMDB_ID":
      case "WATCHLIST_ADD_FAILED":
      default:
        return "Failed to add title. Please try again.";
    }
  }

  if (action === "remove") {
    switch (err.code) {
      case "WATCHLIST_DELETE_FAILED":
      default:
        return "Failed to remove title. Please try again.";
    }
  }

  return err.message || "Watchlist update failed. Please try again.";
}

export default function Home({ user, results, searchMode, watchlist, setWatchlist }) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const navigate = useNavigate();

  function isInWatchlist(imdbID) {
    return watchlist.some((m) => m.imdbID === imdbID);
  }

  async function handleAdd(movie) {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setWatchlistMessage("");

    if (isInWatchlist(movie.imdbID)) {
      return;
    }

    try {
      const item = await addToWatchlist(movie.imdbID);

      setWatchlist((prev) => {
        if (prev.some((m) => m.imdbID === item.imdbID)) {
          return prev;
        }

        return [...prev, item];
      });
    } catch (err) {
      console.error("Failed to add to watchlist:", err);

      if (err.code === "AUTH_REQUIRED" || err.code === "AUTH_INVALID") {
        setShowLoginPrompt(true);
        return;
      }

      if (err.code === "WATCHLIST_ITEM_EXISTS") {
        setWatchlistMessage("This title is already in your watchlist.");
        return;
      }

      setWatchlistMessage(getWatchlistActionErrorMessage(err, "add"));
    }
  }

  async function handleRemove(movie) {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setWatchlistMessage("");

    try {
      await removeFromWatchlist(movie.imdbID);

      setWatchlist((prev) => prev.filter((m) => m.imdbID !== movie.imdbID));
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);

      if (err.code === "AUTH_REQUIRED" || err.code === "AUTH_INVALID") {
        setShowLoginPrompt(true);
        return;
      }

      if (err.code === "WATCHLIST_ITEM_NOT_FOUND") {
        setWatchlist((prev) => prev.filter((m) => m.imdbID !== movie.imdbID));
        return;
      }

      setWatchlistMessage(getWatchlistActionErrorMessage(err, "remove"));
    }
  }

  const safeResults = Array.isArray(results) ? results : [];

  if (searchMode === "searched") {
    return (
      <>
        {watchlistMessage && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-foreground">
            {watchlistMessage}
          </div>
        )}

        <MediaGrid
          heading="Search results"
          items={safeResults}
          mode="add"
          isInWatchlist={isInWatchlist}
          onAdd={handleAdd}
          onRemove={handleRemove}
          emptyMessage="No titles found. Try a different search."
        />

        {showLoginPrompt && (
          <LoginPrompt onGo={() => navigate("/login")} onClose={() => setShowLoginPrompt(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <span className="mb-6 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Films · Series · Games
        </span>

        <h1 className="font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl md:text-6xl max-w-lg">
          Find what’s worth pressing play.
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Search across movies, TV shows, and video games — then build a personal
          watchlist you&apos;ll actually come back to.
        </p>

        <p className="mt-8 text-sm text-faint">
          Start typing in the search bar above to discover something new.
        </p>
      </section>

      {showLoginPrompt && (
        <LoginPrompt onGo={() => navigate("/login")} onClose={() => setShowLoginPrompt(false)} />
      )}
    </>
  );
}

function LoginPrompt({ onGo, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/60 animate-panel-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-foreground">Log in required</h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          You need an account to save titles to your watchlist.
        </p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-surface-2"
          >
            Cancel
          </button>

          <button
            onClick={onGo}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-strong"
          >
            Go to login
          </button>
        </div>
      </div>
    </div>
  );
}