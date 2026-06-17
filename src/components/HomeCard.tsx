"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money, stars, homePhoto } from "@/lib/format";
import type { Home } from "@/lib/types";

export default function HomeCard({ home }: { home: Home }) {
  const { builder, nbhd } = useStore();
  const b = builder(home.builder);
  const n = nbhd(home.nb);

  return (
    <Link href={`/home/${home.id}`} className="card card-hover home-card">
      <div className="photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={homePhoto(home)} alt={home.name} />
        <span className="tag">{home.style}</span>
      </div>
      <div className="body">
        <div className="price">{money(home.price)}</div>
        <h3>{home.name}</h3>
        <div className="by">
          by {b?.name} · {n?.name}
        </div>
        <div style={{ marginTop: ".4rem", fontSize: ".8rem" }}>
          <span className="stars">{stars(home.rating)}</span>{" "}
          <span className="muted">
            {home.rating} ({home.ratings})
          </span>
        </div>
        <div className="specs">
          <span>🛏 {home.beds} bd</span>
          <span>🛁 {home.baths} ba</span>
          <span>📐 {home.sqft.toLocaleString("en-US")} sf</span>
          <span>🚗 {home.garage}</span>
        </div>
      </div>
    </Link>
  );
}
