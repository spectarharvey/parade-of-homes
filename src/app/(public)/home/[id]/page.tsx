"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore, useToast } from "@/lib/store";
import { money, stars, imgUrl } from "@/lib/format";
import { isCommunity } from "@/lib/communities";
import BuilderLogo from "@/components/BuilderLogo";
import HomeCard from "@/components/HomeCard";
import QRScanner from "@/components/QRScanner";
import NotFoundBlock from "@/components/NotFoundBlock";

export default function HomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, ready, guestUser, home, builder, nbhd, visited, route, checkIn, toggleRoute, rateHome, myRatings } =
    useStore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const h = home(id);

  // Decode a scanned check-in QR (…/home/<id>?checkin=1) and record the visit.
  const handleScan = (text: string) => {
    setScanning(false);
    const match = text.match(/\/home\/([^/?#\s]+)/);
    const scannedId = match ? decodeURIComponent(match[1]) : null;
    const target = scannedId && home(scannedId) ? scannedId : null;
    if (!target) {
      toast("That doesn't look like a Parade check-in code.");
      return;
    }
    if (visited.includes(target)) {
      toast("You're already checked in here.");
      return;
    }
    checkIn(target);
    toast("✓ Checked in at " + (home(target)?.name ?? "this home") + "!");
    if (target !== id) router.push(`/home/${target}`);
  };

  // Auto check-in when arriving via a scanned QR code (…/home/<id>?checkin=1)
  useEffect(() => {
    if (!h) return;
    if (searchParams.get("checkin") && !visited.includes(h.id)) {
      checkIn(h.id);
      toast("✓ Checked in at " + h.name + "!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams]);

  if (!h) return <NotFoundBlock />;

  const b = builder(h.builder);
  const n = nbhd(h.nb);
  const builderSite = b?.website
    ? /^https?:\/\//.test(b.website)
      ? b.website
      : `https://${b.website}`
    : null;
  // The model's street address. Older listings kept it as a "Model location: …"
  // feature; fall back to that so a pre-migration listing still shows one.
  const address =
    h.address?.trim() ||
    (h.features
      ?.find((f) => /^model location:/i.test(f))
      ?.replace(/^model location:\s*/i, "")
      .trim() ??
      "");
  const features = h.features.filter((f) => !/^model location:/i.test(f));
  const directionsUrl =
    "https://www.google.com/maps/dir/?" +
    new URLSearchParams({ api: "1", destination: address, travelmode: "driving" });
  const isVisited = visited.includes(h.id);
  const inRoute = route.includes(h.id);
  const related = db.homes
    .filter((x) => x.id !== h.id && (x.nb === h.nb || x.builder === h.builder))
    .slice(0, 3);
  // A single-home community redirects back to this page, so that link is a
  // round trip — only offer it when the community really has more to show.
  const communityHomeCount = db.homes.filter((x) => x.nb === h.nb).length;

  return (
    <div className="wrap">
      {scanning && (
        <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
      )}
      <div className="crumb">
        <Link href="/">Home</Link> / <Link href="/homes">Homes</Link> / {h.name}
      </div>

      <div className="gallery">
        {h.imgs.length ? (
          h.imgs.map((c, i) => {
            const isDocumentAsset = /logo|floor-plan/.test(c);
            return (
              <div
                key={i}
                className={i === 0 ? "g0" : ""}
                style={{
                  backgroundImage: `url('${imgUrl(c, i === 0 ? 1200 : 600)}')`,
                  backgroundSize: isDocumentAsset ? "contain" : "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: isDocumentAsset ? "#fff" : undefined,
                }}
              ></div>
            );
          })
        ) : (
          <div
            className="g0"
            style={{
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "2rem",
              color: "#fff",
              fontFamily: "'Lora', serif",
              fontSize: "1.6rem",
              background: `linear-gradient(135deg, ${n?.color || "#116799"}, #033256)`,
            }}
          >
            {h.name}
          </div>
        )}
      </div>

      <div className="detail-layout" style={{ marginTop: "1.6rem" }}>
        <div>
          <span className="badge badge-gold">{h.style}</span>{" "}
          {b?.featured && (
            <>
              <span className="badge badge-featured-builder">★ Featured Builder</span>{" "}
            </>
          )}
          {h.featured && <span className="badge badge-navy">★ Featured</span>}{" "}
          {isVisited && <span className="badge badge-green">✓ Checked In</span>}
          <h1 style={{ fontSize: "2.2rem", marginTop: ".6rem" }}>{h.name}</h1>
          <p className="muted" style={{ marginTop: "-.2rem" }}>
             {n?.name}, {n?.city} · Built by {b?.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: ".6rem 0", flexWrap: "wrap" }}>
            <div
              className="price"
              style={{
                fontFamily: "Lora",
                fontSize: "1.9rem",
                color: "var(--navy)",
                fontWeight: 600,
              }}
            >
              {money(h.price)}
            </div>
            {h.ratings > 0 && (
              <div>
                <span className="stars" style={{ fontSize: "1.1rem" }}>
                  {stars(h.rating)}
                </span>{" "}
                <span className="muted" style={{ fontSize: ".85rem" }}>
                  {h.rating} · {h.ratings} votes
                </span>
              </div>
            )}
          </div>
          <div className="spec-grid">
            <div className="sp">
              <div className="v">{h.beds}</div>
              <div className="k">Bedrooms</div>
            </div>
            <div className="sp">
              <div className="v">{h.baths}</div>
              <div className="k">Bathrooms</div>
            </div>
            <div className="sp">
              <div className="v">{h.sqft.toLocaleString("en-US")}</div>
              <div className="k">Sq Ft</div>
            </div>
            <div className="sp">
              <div className="v">{h.garage}</div>
              <div className="k">Car Garage</div>
            </div>
          </div>
          <h3 style={{ fontSize: "1.3rem", marginTop: "1.6rem" }}>About this home</h3>
          <p className="muted">{h.blurb}</p>
          {address && (
            <>
              <h3 style={{ fontSize: "1.3rem", marginTop: "1.6rem" }}>Address</h3>
              <p className="muted" style={{ marginBottom: ".4rem" }}>
                <span aria-hidden="true">📍</span> {address}
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                Get Directions ↗
              </a>
            </>
          )}
          <h3 style={{ fontSize: "1.3rem", marginTop: "1.6rem" }}>Features &amp; Finishes</h3>
          {ready ? (
            <ul className="feature-list" style={{ padding: 0, marginTop: ".6rem" }}>
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            // Until the live catalog lands, `db` still holds the seed snapshot
            // bundled with the app. Rendering it here made the list visibly
            // rewrite itself a moment later — placeholders instead of a rewrite.
            <ul
              className="feature-list feature-list-loading"
              style={{ padding: 0, marginTop: ".6rem" }}
              aria-busy="true"
              aria-label="Loading features"
            >
              {Array.from({ length: Math.max(features.length, 4) }).map((_, i) => (
                <li key={i}>
                  <span
                    className="skeleton-bar"
                    style={{ width: `${70 + ((i * 37) % 30)}%` }}
                  />
                </li>
              ))}
            </ul>
          )}
          <hr className="soft" />
          <h3 style={{ fontSize: "1.3rem" }}>Rate this home</h3>
          <p className="muted" style={{ marginTop: "-.2rem", fontSize: ".86rem" }}>
            Tap a star to cast your vote — it counts toward our Awards leaderboard.
          </p>
          <div
            onMouseLeave={() => setHoverStar(0)}
            style={{
              fontSize: "1.8rem",
              color: "var(--gold)",
              cursor: "pointer",
              letterSpacing: "4px",
            }}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <span
                key={v}
                role="button"
                aria-label={`Rate ${v} star${v > 1 ? "s" : ""}`}
                onMouseEnter={() => setHoverStar(v)}
                onClick={() => {
                  rateHome(h.id, v);
                  toast("Thanks for voting! ★ " + v);
                }}
              >
                {v <= (hoverStar || myRatings[h.id] || 0) ? "★" : "☆"}
              </span>
            ))}
          </div>
          {myRatings[h.id] ? (
            <p className="muted" style={{ fontSize: ".82rem", marginTop: ".35rem" }}>
              You rated this {myRatings[h.id]} star{myRatings[h.id] > 1 ? "s" : ""}.
            </p>
          ) : null}
        </div>
        <aside>
          <div className="side-card">
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: ".78rem", fontWeight: 700, margin: "0 0 .2rem" }}>
                Check In
              </p>
              <p className="muted" style={{ fontSize: ".74rem", margin: "0 0 1rem" }}>
                Scan the QR code posted inside the home to record your visit.
              </p>
              <button
                className={"btn " + (isVisited ? "btn-outline" : "btn-gold") + " btn-block"}
                disabled={isVisited}
                onClick={() => {
                  if (!isVisited) setScanning(true);
                }}
              >
                {isVisited ? "✓ Already Checked In" : "📷 Check In Here"}
              </button>
              {ready && !guestUser && (
                <p className="muted" style={{ fontSize: ".72rem", margin: ".7rem 0 0" }}>
                  You must be registered with the Parade of Homes app to vote.{" "}
                  <Link href="/register?tab=login" style={{ color: "var(--navy)", textDecoration: "underline", fontWeight: 600 }}>
                    Log in
                  </Link>{" "}
                  or{" "}
                  <Link href="/register" style={{ color: "var(--navy)", textDecoration: "underline", fontWeight: 600 }}>
                    register
                  </Link>
                  .
                </p>
              )}
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: ".6rem" }}
                onClick={() => {
                  toggleRoute(h.id);
                  toast(inRoute ? "Removed from route" : "Added to your route");
                }}
              >
                {inRoute ? "Remove From My Route" : "+ Add to Route"}
              </button>
            </div>
            <hr className="soft" />
            <h4 style={{ fontSize: ".95rem" }}>Builder</h4>
            <div style={{ display: "flex", gap: ".7rem", alignItems: "center", margin: ".5rem 0" }}>
              <BuilderLogo
                builder={b}
                className="builder-mini-logo"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: b?.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Lora",
                  fontWeight: 700,
                }}
              />
              <div>
                <b style={{ fontSize: ".92rem" }}>{b?.name}</b>
                <div className="muted" style={{ fontSize: ".78rem" }}>
                  {b?.years ? `${b.years} yrs · ` : ""}{b?.phone}
                </div>
              </div>
            </div>
            {builderSite ? (
              <a
                href={builderSite}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-navy btn-block btn-sm"
                style={{ marginTop: ".4rem" }}
              >
                Visit Website ↗
              </a>
            ) : (
              <Link
                href="/builders"
                className="btn btn-navy btn-block btn-sm"
                style={{ marginTop: ".4rem" }}
              >
                View Builder
              </Link>
            )}
          </div>
        </aside>
      </div>

      <section className="block" style={{ paddingBottom: "1rem" }}>
        <div className="row-head">
          <h2 style={{ fontSize: "1.5rem" }}>You may also like</h2>
          {isCommunity(n?.id) && communityHomeCount > 1 && (
            <Link href={`/neighborhood/${n?.id}`} className="btn btn-outline btn-sm">
              More in {n?.name} →
            </Link>
          )}
        </div>
        <div className="grid-3">
          {related.map((r) => (
            <HomeCard key={r.id} home={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
