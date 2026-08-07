"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import HomeCard from "@/components/HomeCard";

// Price brackets from the 2026 Parade award categories.
const PRICE_RANGES = [
  { key: "u300", label: "Under $300,000", min: 0, max: 300000 },
  { key: "300", label: "$300,000 – $399,999", min: 300000, max: 400000 },
  { key: "400", label: "$400,000 – $499,999", min: 400000, max: 500000 },
  { key: "500", label: "$500,000 – $599,999", min: 500000, max: 600000 },
  { key: "600", label: "$600,000 – $699,999", min: 600000, max: 700000 },
  { key: "700", label: "$700,000 – $899,999", min: 700000, max: 900000 },
  { key: "900", label: "$900,000 – $999,999", min: 900000, max: 1000000 },
  { key: "1m", label: "Over $1,000,000", min: 1000000, max: Infinity },
];

const SQFT_RANGES = [
  { key: "u2000", label: "Under 2,000", min: 0, max: 2000 },
  { key: "2000", label: "2,000 – 2,999", min: 2000, max: 3000 },
  { key: "3000", label: "3,000 – 3,999", min: 3000, max: 4000 },
  { key: "4000", label: "4,000 – 4,999", min: 4000, max: 5000 },
  { key: "5000", label: "5,000+", min: 5000, max: Infinity },
];

export default function HomesPage() {
  const { db, builder, nbhd } = useStore();

  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [sqftRange, setSqftRange] = useState("");
  const [sort, setSort] = useState("alpha");

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
          nbhd(h.nb)?.name
        )
          .toLowerCase()
          .includes(term),
      );

    const pr = PRICE_RANGES.find((r) => r.key === priceRange);
    if (pr) list = list.filter((h) => h.price >= pr.min && h.price < pr.max);

    if (beds) list = list.filter((h) => h.beds >= beds);
    if (baths) list = list.filter((h) => h.baths >= baths);

    const sq = SQFT_RANGES.find((r) => r.key === sqftRange);
    if (sq) list = list.filter((h) => h.sqft >= sq.min && h.sqft < sq.max);

    // Ignore a leading "The" so e.g. "The Aspen" sorts under A.
    const nameKey = (name: string) => name.replace(/^the\s+/i, "").toLowerCase();
    list.sort((a, b) =>
      sort === "alpha"
        ? nameKey(a.name).localeCompare(nameKey(b.name))
        : sort === "price-asc"
          ? a.price - b.price
          : sort === "price-desc"
            ? b.price - a.price
            : sort === "beds"
              ? b.beds - a.beds
              : sort === "baths"
                ? b.baths - a.baths
                : sort === "sqft"
                  ? b.sqft - a.sqft
                  : (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
    );
    return list;
  }, [db.homes, query, priceRange, beds, baths, sqftRange, sort, builder, nbhd]);

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
        <span className="eyebrow">Showscase Listings</span>
        <h2>Explore All Homes</h2>
        <p className="muted">
          Filter {db.homes.length} showcase homes by price, bedrooms &amp;
          bathrooms, and square footage.
        </p>
      </div>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search homes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>
          <span className="field-label">Price</span>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">Any Price</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Beds</span>
          <select value={beds} onChange={(e) => setBeds(Number(e.target.value))}>
            <option value={0}>Any</option>
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}+
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Baths</span>
          <select value={baths} onChange={(e) => setBaths(Number(e.target.value))}>
            <option value={0}>Any</option>
            {[1, 2, 3, 4].map((v) => (
              <option key={v} value={v}>
                {v}+
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Sq Ft</span>
          <select value={sqftRange} onChange={(e) => setSqftRange(e.target.value)}>
            <option value="">Any Size</option>
            {SQFT_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </span>
        <span>
          <span className="field-label">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="alpha">Alphabetical (A–Z)</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="beds">Most Bedrooms</option>
            <option value="baths">Most Bathrooms</option>
            <option value="sqft">Largest (Sq Ft)</option>
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
