import { useMemo, useState } from "react";
import Dropdown from "./Dropdown";
import PosterCard from "./PosterCard";
import ItemDetail from "./ItemDetail";
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  applyFilter,
  applySort,
} from "../utils/mediaHelpers";

export default function MediaGrid({
  heading,
  items,
  mode, // "add" | "remove"
  isInWatchlist,
  onAdd,
  onRemove,
  emptyMessage,
}) {
  const [sort, setSort] = useState("Relevance");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const safe = Array.isArray(items) ? items : [];
    return applySort(applyFilter(safe, filter), sort);
  }, [items, filter, sort]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* toolbar */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">{heading}</h2>
          <p className="mt-1 text-sm text-muted">
            {visible.length} {visible.length === 1 ? "title" : "titles"}
            {filter !== "All" ? ` · ${filter}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} />
          <Dropdown label="Filter" value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
        </div>
      </div>

      {/* grid */}
      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((item) => (
            <PosterCard
              key={item.imdbID}
              item={item}
              mode={mode}
              inWatchlist={isInWatchlist ? isInWatchlist(item.imdbID) : false}
              onAdd={onAdd}
              onRemove={onRemove}
              onOpen={setSelected}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-muted">
          {emptyMessage || "Nothing matches these filters."}
        </p>
      )}

      {selected && <ItemDetail item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}