import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWatchlist } from "../services/watchlist";
import MediaGrid from "../components/MediaGrid";

export default function Home({ user, results, searchMode, watchlist, setWatchlist }) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  function isInWatchlist(imdbID) {
    return watchlist.some((m) => m.imdbID === imdbID);
  }

  async function handleAdd(movie) {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (isInWatchlist(movie.imdbID)) return;

    try {
      const item = await addToWatchlist(movie.imdbID);
      setWatchlist((prev) => {
        if (prev.some((m) => m.imdbID === item.imdbID)) return prev;
        return [...prev, item];
      });
    } catch (err) {
      if (err.status === 401) console.warn("Must be logged in to add to watchlist");
      else if (err.status === 409) console.warn("Already in watchlist");
      else console.error("Failed to add to watchlist", err);
    }
  }

  const safeResults = Array.isArray(results) ? results : [];

  // Results state — any completed search, including zero results
  if (searchMode === 'searched') {
    return (
      <>
        <MediaGrid
          heading="Search results"
          items={safeResults}
          mode="add"
          isInWatchlist={isInWatchlist}
          onAdd={handleAdd}
          emptyMessage="No titles found. Try a different search."
        />
        {showLoginPrompt && (
          <LoginPrompt onGo={() => navigate("/login")} onClose={() => setShowLoginPrompt(false)} />
        )}
      </>
    );
  }

  // Idle state — hero shown before any search
  return (
    <>
      <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <span className="mb-6 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Films · Series · Games
        </span>
        <h1 className="font-serif text-4xl leading-tight text-foreground text-balance sm:text-5xl md:text-6xl">
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