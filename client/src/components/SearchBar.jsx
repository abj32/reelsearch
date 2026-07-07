import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../services/search";

export default function SearchBar({ setResults, setSearchMode }) {
  const [query, setQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // prevents page reload
    
    const trimmed = query.trim();

    if (trimmed.length === 0) { // Do nothing on blank search
      setSearchMessage("Please enter a search term.");
      return;
    }

    setSearchMessage("");
    setResults([]); // Clear results

    try {
      const movies = await searchMovies(trimmed);
      setResults(movies);
      setSearchMode('searched');
      navigate("/");
    } catch (err) {
      console.error("Search failed", err);

      if (err.code === "TOO_MANY_RESULTS") {
        setSearchMessage("Please refine your search.");
        return;
      }

      setSearchMessage("Search failed. Please try again.");
    }
  }

  return (
    <div className="relative min-w-0 w-full">
      <form onSubmit={handleSubmit}>
        <div className="group flex min-w-0 items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 transition focus-within:border-primary/60 focus-within:bg-surface-2 hover:border-border-strong">
          <svg
            className="h-4.5 w-4.5 shrink-0 text-faint transition group-focus-within:text-primary"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m17 17-3.2-3.2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search films, series, games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-faint focus:outline-none sm:text-base"
          />
        </div>

        {searchMessage && (
          <div className="absolute left-0 right-0 z-30 mt-2 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-foreground shadow-lg">
            {searchMessage}
          </div>
        )}
      </form>
    </div>
  );
}