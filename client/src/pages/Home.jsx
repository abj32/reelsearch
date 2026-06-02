import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWatchlist } from "../services/watchlist";

export default function Home( { user, results, watchlist, setWatchlist }) {
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
      setWatchlist(prev => {
        if (prev.some(m => m.imdbID === item.imdbID)) return prev;
        return [...prev, item];
      });
    } catch (err) {
      if (err.status === 401) {
        console.warn("Must be logged in to add to watchlist");
      } else if (err.status === 409) {
        console.warn("Already in watchlist");
      } else {
        console.error("Failed to add to watchlist", err);
      }
    }
  }

  const TYPE_STYLES = {
  movie:  { color: "bg-red-500",   label: "M" },
  series: { color: "bg-teal-500",  label: "S" },
  game:   { color: "bg-purple-500", label: "G" },
  }

  return (
    <>
      <div>
        {results.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-x-[2%] gap-y-4 sm:gap-y-5 md:gap-y-6">
            {results.map((movie) => {
              const { color, label } = TYPE_STYLES[movie.Type];

              return (
                // Movie Card
                <li key={movie.imdbID} className="overflow-hidden flex flex-col w-[46%] sm:w-[30%] md:w-[22%] lg:w-[17%] bg-white rounded-lg shadow-lg">
                  {/* Movie Poster */}
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/300x412?text=No+Image"}
                    alt={movie.Title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x412?text=No+Image";
                    }}
                  />

                  {/* Space Below Movie Image */}
                  <div className="flex flex-grow flex-row">
                    {/* Movie Details */}
                    <div className="flex flex-col p-[4%] md:p-[3%] w-[75%]">
                      {/* Movie Title */}
                      <h3 className="pb-[2px] md:pb-[4px] xl:pb-[6px] text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-semibold">{movie.Title}</h3>
                      <div className="flex justify-start items-center gap-[5%] md:gap-[6%] lg:gap-[7%]">

                      {/* Movie Year */}
                      <span className="max-w-[31%] lg:max-w-[33px] xl:max-w-[38px] text-[10px] md:text-[11px] lg:text-[12px] xl:text-[14px] text-gray-600">{movie.Year}</span>
                      {/* Entertainment Type */}
                      <span className={`flex items-center justify-center p-[1%] px-[4%] text-white text-[6px] md:text-[7px] lg:text-[8px] xl:text-[10px] font-bold rounded ${color}`}>
                        {label}
                      </span>
                      {/* Age Rating */}
                      <span className="flex items-center p-[1%] px-[3%] text-[6px] md:text-[7px] lg:text-[8px] xl:text-[10px] font-semibold text-gray-700 bg-gray-200 border border-gray-400 rounded">
                        {movie.Rated !== "N/A" ? movie.Rated : "NR"}
                      </span>
                      </div>
                    </div>

                    {/* Watchlist Add Button */}
                    <div className="flex w-[25%]">
                      {watchlist.some((m) => m.imdbID === movie.imdbID) ? (
                        // ✓ for movies/shows already in the watchlist
                        <span className="flex items-center justify-center w-full h-full text-[9px] sm:text-[12px] md:text-[15px] lg:text-[18px] xl:text-[22px] text-white bg-indigo-600">✓</span>
                      ) : (
                        // + button for unadded movies/shows
                        <button
                          type="button"
                          onClick={() => handleAdd(movie)}
                          className="w-full h-full text-[20px] lg:text-[22px] xl:text-[26px] text-white bg-indigo-600"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Default Home Screen (No Search) */}
        {results.length === 0 && (
          <h2 className="text-center text-gray-500 text-lg">Your recommended movies will appear here later!</h2>
        )}
      </div>

      {/* Login required popup */}
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-start justify-center pt-40 md:pt-48 xl:pt-56">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">
              Log in required
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              You need to be logged in to save movies to your watchlist.
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={() => {setShowLoginPrompt(false); navigate("/login");}} className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Go to login</button>
              <button onClick={() => setShowLoginPrompt(false)} className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}