import { removeFromWatchlist } from "../services/watchlist";

export default function Watchlist({ watchlist, setWatchlist }) {

  async function handleDelete(imdbID) {
    try {
      await removeFromWatchlist(imdbID);
      setWatchlist(prev => prev.filter(m => m.imdbID !== imdbID));
    } catch (err) {
      console.error("Failed to remove movie", err);
    }
  }

  function getRatingLabel(movie, source) {
    return movie.Ratings.find(r => r.Source === source)?.Value || "N/A";
  }

  const TYPE_STYLES = {
  movie:  { color: "bg-red-500",   label: "M" },
  series: { color: "bg-teal-500",  label: "S" },
  game:   { color: "bg-purple-500", label: "G" },
  }

  return (
    <div>
      <h2 className="mb-[2.75%] sm:mb-[2.5%] md:mb-[2.25%] lg:mb-[2%] xl:mb-[1.75%] text-sm sm:text-base md:text-lg xl:text-xl font-semibold text-indigo-600 text-center">Your Watchlist</h2>

      {watchlist.length > 0 && (
        <ul>
          {watchlist.map((movie) => {
            const { color, label } = TYPE_STYLES[movie.Type];

            const imdb = getRatingLabel(movie, "Internet Movie Database");
            const rt   = getRatingLabel(movie, "Rotten Tomatoes");
            const mc   = getRatingLabel(movie, "Metacritic");
            
            return (
              <li key={movie.imdbID} className="relative m-[1%] my-[2%] md:my-[1.5%] xl:my-[1%] bg-white rounded-lg shadow-md">
                {/* Top bar displays movie\show title, year, type, age rating, and genres */}
                <div className="group relative flex items-center px-[1%] py-[.5%]">
                  {/* Title */}
                  <h3 className="m-[.5%] max-w-[45%] text-sm sm:text-base lg:text-lg font-medium">{movie.Title}</h3>
                  {/* Year */}
                  <p className="m-[.5%] ml-[1.5%] text-xs sm:text-sm lg:text-base text-gray-500">{movie.Year}</p>

                  {/* Entertainment Type */}
                  <span
                      className={`flex justify-center m-[.6%] md:m-[.5%] l:m-[.4%] xl:m-[.3%] ml-[3%] md:ml-[3%] xl:ml-[3%] p-[.2%] w-[14px] sm:w-[16px] md:w-[18px] lg:w-[22px] xl:w-[26px] text-white text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] font-bold rounded ${color}`}>
                      {label}
                  </span>
                  {/* Age Rating */}
                  <span className="flex m-[.6%] md:m-[.5%] l:m-[.4%] xl:m-[.3%] p-[.2%] px-[.5%] text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] font-semibold text-gray-700 bg-gray-200 border border-gray-400 rounded">
                      {movie.Rated || "NR"}
                  </span>
                  {/* Genres */}
                  <span className="flex m-[.6%] md:m-[.5%] l:m-[.4%] xl:m-[.3%] p-[.3%] px-[.6%] text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] xl:text-[9px] font-semibold text-gray-700 bg-gray-200 border border-gray-300 rounded">{movie.Genre}</span>

                  {/* Delete Button */}
                  <button onClick={() => handleDelete(movie.imdbID)} className="ml-auto text-xs sm:text-sm lg:text-base">
                    🗑️
                  </button>

                  {/* On hover panel displays movie poster, plot, director, actors, and critic ratings */}
                  <div className="pointer-events-none absolute left-0 right-0 top-full z-10 hidden group-hover:flex items-start p-[1.5%] bg-gray-100 shadow-lg rounded-lg">
                    {/* Movie Poster */}
                    <img
                      className="w-[17%] rounded"
                      src={movie.Poster || "https://placehold.co/300x412?text=No+Image"}
                      alt={movie.Title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x412?text=No+Image";
                      }}
                    />

                    {/* Details to the right */}
                    <div className="mx-[1.5%]">
                      {/* Movie Plot */}
                        <p className="text-xs sm:text-sm lg:text-base"><strong>Plot</strong></p>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-700">{movie.Plot}</p>
                      
                      <div className="mt-[1%] text-xs md:text-sm xl:text-base text-gray-700">
                        {/* Movie Director */}
                        <p><strong>Director:</strong> {movie.Director}</p>
                        {/* Actors/Actresses */}
                        <p><strong>Actors:</strong> {movie.Actors}</p>
                      </div>

                      {/* Ratings */}
                      <p className="mt-[2%] text-xs md:text-sm xl:text-base"><strong>Ratings</strong></p>
                      <div className="flex text-xs md:text-sm xl:text-base text-gray-700">                    
                        {/* IMDB Score */}
                        <p><strong>IMDb:</strong> {imdb}</p>
                        {/* Rotten Tomatoes Score */}
                        <p className="ml-[3%]"><strong>Rotten Tomatoes:</strong> {rt}</p>
                        {/* Metacritic Score */}
                        <p className="ml-[3%]"><strong>Metacritic:</strong> {mc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {watchlist.length === 0 && (
        <p className="mt-2 text-center text-gray-600">Saved movies will appear here.</p>
      )}
    </div>
  );
}