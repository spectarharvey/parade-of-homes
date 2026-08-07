"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { moneyK, homePhoto, NO_IMAGE_FALLBACK } from "@/lib/format";

export default function NeighborhoodsPage() {
  const { db } = useStore();

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Communities
      </div>
      <div className="sec-head">
        <span className="eyebrow">Explore Local</span>
        <h2>Our Communities</h2>
        <p>
          Browse the current 2026 Parade subdivisions and model-home locations.
        </p>
      </div>
      {db.neighborhoods.map((n, i) => {
        const homes = db.homes.filter((h) => h.nb === n.id);
        const avg = homes.length
          ? Math.round(homes.reduce((s, h) => s + h.price, 0) / homes.length)
          : 0;
        // Fall back to a photo from a home in this community (then a placeholder)
        // when the neighborhood has no image of its own, so the card is never blank.
        const photoHome = homes.find((h) => h.imgs && h.imgs.length);
        const cardImg = n.img || (photoHome ? homePhoto(photoHome) : NO_IMAGE_FALLBACK);
        const reverse = i % 2 === 1;
        return (
          <div
            key={n.id}
            className={`card neighborhood-card${reverse ? " reverse" : ""}`}
          >
            <div
              className="neighborhood-card-img"
              style={{
                background: `url('${cardImg}') center/cover`,
              }}
            ></div>
            <div
              className="neighborhood-card-content"
            >
              <span className="badge badge-gold">
                <span
                  className="dot"
                  style={{
                    background: n.color,
                    display: "inline-block",
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                  }}
                ></span>{" "}
                {n.city}
              </span>
              <h2 style={{ fontSize: "1.9rem", marginTop: ".5rem" }}>
                {n.name}
              </h2>
              <p className="muted">{n.blurb}</p>
              <div style={{ display: "flex", gap: "2rem", margin: "1.2rem 0" }}>
                <div>
                  <div
                    style={{
                      fontFamily: "Lora",
                      fontSize: "1.5rem",
                      color: "var(--navy)",
                    }}
                  >
                    {homes.length}
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: ".74rem",
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    Homes
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Lora",
                      fontSize: "1.5rem",
                      color: "var(--navy)",
                    }}
                  >
                    {moneyK(n.low)}–{moneyK(n.high)}
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: ".74rem",
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    Price Range
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Lora",
                      fontSize: "1.5rem",
                      color: "var(--navy)",
                    }}
                  >
                    {moneyK(avg)}
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: ".74rem",
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    Avg Price
                  </div>
                </div>
              </div>
              <Link
                href={`/neighborhood/${n.id}`}
                className="btn btn-navy btn-sm"
              >
                View Model Home{homes.length === 1 ? "" : "s"} →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
