"use client";

import Link from "next/link";
import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { money, stars, imgUrl, cloudinaryUrl, NO_IMAGE_FALLBACK } from "@/lib/format";
import { isPremierHome } from "@/lib/builderTier";
import type { Home } from "@/lib/types";

/** Card width across the breakpoints in globals.css (`.grid-3` inside `.wrap`). */
const CARD_SIZES = "(max-width: 768px) 85vw, (max-width: 1100px) 50vw, 410px";

/** Let Cloudinary do the resizing rather than re-encoding what it already sized. */
const cloudinaryLoader = ({ src, width }: ImageLoaderProps) =>
  cloudinaryUrl(src, width);

export default function HomeCard({
  home,
  priority = false,
}: {
  home: Home;
  /** Load this card's photo eagerly — for the first cards in view. */
  priority?: boolean;
}) {
  const { builder, nbhd, ready } = useStore();
  const b = builder(home.builder);
  const n = nbhd(home.nb);
  const [imageFailed, setImageFailed] = useState(false);

  const raw = home.imgs?.[0] || "";
  // Cloudinary sizes its own images through the loader below; everything else
  // (local /parade-entries files, Unsplash codes) goes through Next's optimizer.
  const isCloudinary = /^https:\/\/res\.cloudinary\.com\//.test(raw);
  const src = raw ? (isCloudinary ? raw : imgUrl(raw, 800)) : "";

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <Link href={`/home/${home.id}`} className="card card-hover home-card">
      <div className="photo">
        {!ready ? (
          // The store paints from the bundled seed catalog until the live one
          // lands, and most seeded homes carry no photo — rendering that would
          // flash "Photo coming soon" on nearly every card before the real image.
          <span className="photo-skeleton" aria-hidden="true" />
        ) : !src || imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={NO_IMAGE_FALLBACK}
            alt={home.name}
            style={{ objectFit: "contain", background: "#f8fafc" }}
          />
        ) : (
          <Image
            src={src}
            alt={home.name}
            fill
            sizes={CARD_SIZES}
            loader={isCloudinary ? cloudinaryLoader : undefined}
            priority={priority}
            onError={() => setImageFailed(true)}
            style={{ objectFit: "cover" }}
          />
        )}
        <span className="tag">{home.style}</span>
        {/* The featured builder outranks the tier tag on every one of their homes. */}
        {b?.featured ? (
          <span className="tag tag-featured-builder">★ Featured Builder</span>
        ) : (
          isPremierHome(home, b) && <span className="tag tag-premier">Premier</span>
        )}
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
