import { getPoster, getStarRating, getTypeMeta } from "../utils/mediaHelpers";

function StarBadge({ rating }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-primary backdrop-blur-sm ring-1 ring-white/10">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.8l-5.2 2.72.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
      </svg>
      {rating.toFixed(1)}
    </div>
  );
}

export default function PosterCard({ item, mode, inWatchlist, onAdd, onRemove, onOpen }) {
  const poster = getPoster(item);
  const rating = getStarRating(item);
  const type = getTypeMeta(item.Type);
  const rated = item.Rated && item.Rated !== "N/A" ? item.Rated : "NR";

  return (
    <li className="group animate-fade-up">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(item);
          }
        }}
        className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface-2 shadow-lg shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {poster ? (
          <img
            src={poster}
            alt={`${item.Title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center font-serif text-sm text-faint">
            {item.Title}
          </div>
        )}

        {/* gradient scrim for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />

        {/* star rating badge, top-left */}
        <div className="absolute left-2 top-2">
          <StarBadge rating={rating} />
        </div>

        {/* add / remove button, top-right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (mode === "remove") onRemove(item);
            else if (!inWatchlist) onAdd(item);
          }}
          disabled={mode === "add" && inWatchlist}
          aria-label={
            mode === "remove"
              ? `Remove ${item.Title} from watchlist`
              : inWatchlist
                ? `${item.Title} is in your watchlist`
                : `Add ${item.Title} to watchlist`
          }
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-lg ring-1 transition ${
            mode === "remove"
              ? "bg-black/70 text-destructive ring-white/10 backdrop-blur-sm hover:bg-destructive hover:text-white"
              : inWatchlist
                ? "cursor-default bg-primary text-on-primary ring-transparent"
                : "bg-black/70 text-foreground ring-white/10 backdrop-blur-sm hover:bg-primary hover:text-on-primary"
          }`}
        >
          {mode === "remove" ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h12M8.5 9v5M11.5 9v5M5.5 6l.7 9.2a1 1 0 0 0 1 .8h5.6a1 1 0 0 0 1-.8L15.5 6M7.5 6V4.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : inWatchlist ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m4 10.5 3.5 3.5L16 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4.5v11M4.5 10h11" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* meta below poster */}
      <div className="mt-3 px-0.5">
        <h3 className="truncate font-medium leading-snug text-foreground" title={item.Title}>
          {item.Title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted">{item.Year}</span>
          <span className="h-1 w-1 rounded-full bg-faint" aria-hidden="true" />
          <span className="font-medium uppercase tracking-wide text-primary">{type.label}</span>
          <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {rated}
          </span>
        </div>
      </div>
    </li>
  );
}