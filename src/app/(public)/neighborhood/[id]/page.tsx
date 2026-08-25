"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { moneyK } from "@/lib/format";
import { isCommunity } from "@/lib/communities";
import HomeCard from "@/components/HomeCard";

export default function NeighborhoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, ready, nbhd } = useStore();
  const router = useRouter();
  const n = nbhd(id);

  const homes = db.homes.filter((h) => h.nb === id);

  // A community with a single model home has nothing to list, so send visitors
  // straight to that home — from any entry point, including old links and
  // bookmarks. Gated on `ready` so the count comes from the live catalog and not
  // the seed snapshot bundled with the app; a second home re-enables this page.
  const soleHomeId =
    ready && isCommunity(id) && homes.length === 1 ? homes[0].id : null;
  useEffect(() => {
    if (soleHomeId) router.replace(`/home/${soleHomeId}`);
  }, [soleHomeId, router]);

  // Only the curated communities have a public page; other neighborhoods are
  // just model-home locations (Morriston, Marion Oaks, …) and 404 here.
  if (!n || !isCommunity(id)) {
    return (
      <div className="wrap">
        <div className="empty" style={{ padding: "5rem" }}>
          <div style={{ fontSize: "3rem" }}>🏚️</div>
          <h2>Page not found</h2>
          <p className="muted">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="btn btn-gold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Redirecting to the sole model home — don't paint this page on the way out.
  if (soleHomeId) return null;

  return (
    <>
      <section
        style={{
          background: `linear-gradient(160deg,rgba(10,28,48,.78),rgba(15,39,66,.7)),url('${n.img}') center/cover`,
          color: "#fff",
          padding: "3.6rem 0",
        }}
      >
        <div className="wrap">
          <div className="crumb" style={{ color: "#cdd8e3" }}>
            <Link href="/" style={{ color: "#cdd8e3" }}>
              Home
            </Link>{" "}
            /{" "}
            <Link href="/communities" style={{ color: "#cdd8e3" }}>
              Communities
            </Link>{" "}
            / {n.name}
          </div>
          <span
            className="badge"
            style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}
          >
            <span
              className="dot"
              style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: n.color,
              }}
            ></span>{" "}
            {n.city}
          </span>
          <h1
            style={{ color: "#fff", fontSize: "2.6rem", marginTop: ".5rem" }}
          >
            {n.name}
          </h1>
          <p style={{ color: "#dce5ee", maxWidth: 620 }}>{n.blurb}</p>
          <div style={{ display: "flex", gap: "2.5rem", marginTop: "1.2rem" }}>
            <div>
              <div
                style={{
                  fontFamily: "Lora",
                  fontSize: "1.8rem",
                  color: "var(--gold-light)",
                }}
              >
                {homes.length}
              </div>
              <div
                style={{
                  fontSize: ".74rem",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  color: "#bcc8d4",
                }}
              >
                {homes.length === 1 ? "Home" : "Homes"}
              </div>
            </div>
            {n.showPrice !== false && (
              <div>
                <div
                  style={{
                    fontFamily: "Lora",
                    fontSize: "1.8rem",
                    color: "var(--gold-light)",
                  }}
                >
                  {moneyK(n.low)}–{moneyK(n.high)}
                </div>
                <div
                  style={{
                    fontSize: ".74rem",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    color: "#bcc8d4",
                  }}
                >
                  Price Range
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: "2.4rem" }}>
        <div className="row-head">
          <h2 style={{ fontSize: "1.6rem" }}>Homes in {n.name}</h2>
          <Link href="/map" className="btn btn-outline btn-sm">
            View on Map →
          </Link>
        </div>
        <div className="grid-3">
          {homes.length ? (
            homes.map((h) => <HomeCard key={h.id} home={h} />)
          ) : (
            <div className="empty">
              No homes listed yet in this neighborhood.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
