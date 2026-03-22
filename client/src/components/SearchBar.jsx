import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../services/search";

export default function SearchBar({ setResults }) {
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

      if (movies.length === 0) {
        setSearchMessage("No movies found.");
      }

      navigate("/");
    } catch (err) {
      console.error("Search failed", err);

      if (err.body?.code === "TOO_MANY_RESULTS") {
        setSearchMessage("Please refine your search.");
        return;
      }

      setSearchMessage("Search failed. Please try again.");
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for Movie Title..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="p-3 w-full text-base sm:text-lg md:text-xl indent-1 sm:indent-2 md:indent-3 lg:indent-4 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {searchMessage && (
          <div className="absolute left-0 mt-2 w-full text-sm sm:text-base md:text-lg bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md shadow">
            {searchMessage}
          </div>
        )}
      </form>
    </div>
  )
}