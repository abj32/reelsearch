import { useEffect } from "react";
import { getCriticScores, getPoster, getStarRating, getTypeMeta } from "../utils/mediaHelpers";

// min-w-0 prevents CSS Grid from letting this cell overflow its column on narrow screens.
// Centered on mobile, left-aligned on sm+.
function ScoreCard({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl border border-border bg-surface-2 px-2 py-3 text-center sm:items-start sm:px-4 sm:text-left">
      <span className="text-[10px] uppercase tracking-wide text-faint sm:text-xs">{label}</span>
      <span className="mt-1 font-serif text-lg text-foreground sm:text-xl">{value}</span>
    </div>
  );
}

export default function ItemDetail({ item, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!item) return null;

  const poster  = getPoster(item);
  const rating  = getStarRating(item);
  const type    = getTypeMeta(item.Type);
  const rated   = item.Rated && item.Rated !== "N/A" ? item.Rated : "NR";
  const scores  = getCriticScores(item);

  const field = (v) => (v && v !== "N/A" ? v : "—");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-overlay-in sm:p-6 md:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.Title} details`}
    >
      <div
        className="relative my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/60 animate-panel-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-foreground ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-black/80"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row">
          {/* Poster */}
          <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-56">
            <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-2 shadow-lg">
              {poster ? (
                <img src={poster} alt={`${item.Title} poster`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-3 text-center font-serif text-sm text-faint">
                  {item.Title}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl text-balance">
              {item.Title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">{item.Year}</span>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                {type.label}
              </span>
              <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
                {rated}
              </span>
              {rating != null && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.8l-5.2 2.72.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
                  </svg>
                  {rating.toFixed(1)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">{field(item.Plot)}</p>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold text-foreground">Director</dt>
                <dd className="text-muted">{field(item.Director)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold text-foreground">Cast</dt>
                <dd className="text-muted">{field(item.Actors)}</dd>
              </div>
            </dl>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <ScoreCard label="IMDb"       value={scores.imdb} />
              <ScoreCard label="RT"         value={scores.rt}   />
              <ScoreCard label="Metacritic" value={scores.mc}   />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}