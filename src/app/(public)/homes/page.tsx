"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import HomeCard from "@/components/HomeCard";

export default function HomesPage() {
  const { db, builder, nbhd } = useStore();

  const [query, setQuery] = useState("");
  const [builderFilter, setBuilderFilter] = useState("");
  const [nbFilter, setNbFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [sort, setSort] = useState("featured");

  const styles = useMemo(
    () => [...new Set(db.homes.map((h) => h.style))],
    [db.homes],
  );

  const results = useMemo(() => {
    let list = db.homes.slice();
    const term = (query || "").toLowerCase();
    if (term)
      list = list.filter((h) =>
        (
          h.name +
          " " +
          builder(h.builder)?.name +
          " " +
          h.style +
          " " +
          nbhd(h.nb)?.name
        )
          .toLowerCase()
          .includes(term),
      );
    if (builderFilter) list = list.filter((h) => h.builder === builderFilter);
    if (nbFilter) list = list.filter((h) => h.nb === nbFilter);
    if (styleFilter) list = list.filter((h) => h.style === styleFilter);
    list.sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "rating"
            ? b.rating - a.rating
            : sort === "checkins"
              ? b.checkins - a.checkins
              : sort === "sqft"
                ? b.sqft - a.sqft
                : (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
    );
    return list;
  }, [db.homes, query, builderFilter, nbFilter, styleFilter, sort, builder, nbhd]);

  const n = results.length;

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Homes
      </div>
      <div
        className="sec-head left"
        style={{ marginBottom: "1.4rem", maxWidth: "none" }}
      >
        <span className="eyebrow">Showcase Listings</span>
        <h2>Explore All Homes</h2>
        <p className="muted">
          Search and filter {db.homes.length} showcase homes by builder,
          neighborhood, style and price.
        </p>
      </div>
      <div className="toolbar">
        <input
          type="search"
          placeholder="🔍 Search homes, builders, styles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>
          <span className="field-label">Builder</span>
          <select
            value={builderFilter}
            onChange={(e) => setBuilderFilter(e.target.value)}
          >
            <option value="">All</option>
            {db.builders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Area</span>
          <select value={nbFilter} onChange={(e) => setNbFilter(e.target.value)}>
            <option value="">All</option>
            {db.neighborhoods.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Style</span>
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
          >
            <option value="">All</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="rating">Top Rated</option>
            <option value="checkins">Most Visited</option>
            <option value="sqft">Largest</option>
          </select>
        </span>
      </div>
      <p className="muted" style={{ fontSize: ".85rem", margin: "0 0 1rem" }}>
        Showing {n} home{n !== 1 ? "s" : ""}
      </p>
      <div className="grid-3">
        {n ? (
          results.map((h) => <HomeCard key={h.id} home={h} />)
        ) : (
          <div className="empty" style={{ gridColumn: "1/-1" }}>
            No homes match your filters. Try clearing them.
          </div>
        )}
      </div>
    </div>
  );
}
