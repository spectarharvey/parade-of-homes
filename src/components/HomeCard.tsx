"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { money, stars, homePhoto, NO_IMAGE_FALLBACK } from "@/lib/format";
import { isPremierBuilder } from "@/lib/builderTier";
import type { Home } from "@/lib/types";

export default function HomeCard({ home }: { home: Home }) {
  const { builder, nbhd } = useStore();
  const b = builder(home.builder);
  const n = nbhd(home.nb);
  const photo = homePhoto(home);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photo]);

  return (
    <Link href={`/home/${home.id}`} className="card card-hover home-card">
      <div className="photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          src={!imageFailed ? photo : NO_IMAGE_FALLBACK}
          alt={home.name}
          onError={() => setImageFailed(true)}
          style={imageFailed ? { objectFit: "contain", background: "#f8fafc" } : undefined}
        />
        <span className="tag">{home.style}</span>
        {isPremierBuilder(b) && <span className="tag tag-premier">Premier</span>}
      </div>
      <div className="body">
        <div className="price">{money(home.price)}</div>
        <h3>{home.name}</h3>
        <div className="by">
          by {b?.name} · {n?.name}
        </div>
        {home.ratings > 0 && (
          <div style={{ marginTop: ".4rem", fontSize: ".8rem" }}>
            <span className="stars">{stars(home.rating)}</span>{" "}
            <span className="muted">
              {home.rating} ({home.ratings})
            </span>
          </div>
        )}
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
