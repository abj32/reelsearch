import { getStarRating, TYPE_META } from "../utils/mediaHelpers";

function StatChip({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-4 text-center">
      <p className="font-serif text-2xl text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}

export default function Profile({ user, watchlist = [], onLogout }) {
  if (!user) {
    return <p className="mt-16 text-center text-muted">You are not logged in.</p>;
  }

  const initial = user.email?.[0]?.toUpperCase() || "?";
  const total = watchlist.length;

  const rated = watchlist.map(getStarRating).filter((r) => r != null);
  const avgRating = rated.length
    ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1)
    : "—";

  const countByType = (type) => watchlist.filter((m) => m.Type === type).length;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {/* banner */}
        <div className="h-24 bg-gradient-to-r from-primary/25 to-primary/5 sm:h-28" />

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-col items-center gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary font-serif text-4xl text-on-primary shadow-lg sm:h-28 sm:w-28">
              {initial}
            </div>
            <div className="text-center sm:pb-2 sm:text-left">
              <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{user.email}</h1>
              <p className="mt-1 text-sm text-muted">Member since {memberSince}</p>
            </div>
          </div>

          {/* stat chips */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatChip label="Watchlist" value={total} />
            <StatChip label="Avg rating" value={avgRating} />
            <StatChip label={`${TYPE_META.movie.label}s`} value={countByType("movie")} />
            <StatChip label="Series" value={countByType("series")} />
            <StatChip label={`${TYPE_META.game.label}s`} value={countByType("game")} />
          </div>

          <div className="mt-8 flex justify-center sm:justify-start">
            <button
              onClick={onLogout}
              className="rounded-full border border-destructive/50 bg-destructive/10 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}