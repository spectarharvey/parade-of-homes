"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, useToast } from "@/lib/store";
import { money, stars, imgUrl } from "@/lib/format";
import HomeCard from "@/components/HomeCard";
import QRCode from "@/components/QRCode";
import NotFoundBlock from "@/components/NotFoundBlock";

export default function HomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, home, builder, nbhd, visited, route, checkIn, toggleRoute, rateHome } =
    useStore();
  const { toast } = useToast();

  const h = home(id);
  if (!h) return <NotFoundBlock />;

  const b = builder(h.builder);
  const n = nbhd(h.nb);
  const isVisited = visited.includes(h.id);
  const inRoute = route.includes(h.id);
  const related = db.homes
    .filter((x) => x.id !== h.id && (x.nb === h.nb || x.builder === h.builder))
    .slice(0, 3);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / <Link href="/homes">Homes</Link> / {h.name}
      </div>

      <div className="gallery">
        {h.imgs.map((c, i) => (
          <div
            key={i}
            className={i === 0 ? "g0" : ""}
            style={{ backgroundImage: `url('${imgUrl(c, i === 0 ? 1200 : 600)}')` }}
          ></div>
        ))}
      </div>

      <div className="detail-layout" style={{ marginTop: "1.6rem" }}>
        <div>
          <span className="badge badge-gold">{h.style}</span>{" "}
          {h.featured && <span className="badge badge-navy">★ Featured</span>}{" "}
          {isVisited && <span className="badge badge-green">✓ Checked In</span>}
          <h1 style={{ fontSize: "2.2rem", marginTop: ".6rem" }}>{h.name}</h1>
          <p className="muted" style={{ marginTop: "-.2rem" }}>
            📍 {n?.name}, {n?.city} · Built by {b?.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: ".6rem 0" }}>
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
            <div>
              <span className="stars" style={{ fontSize: "1.1rem" }}>
                {stars(h.rating)}
              </span>{" "}
              <span className="muted" style={{ fontSize: ".85rem" }}>
                {h.rating} · {h.ratings} votes
              </span>
            </div>
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
          <h3 style={{ fontSize: "1.3rem", marginTop: "1.6rem" }}>Features &amp; Finishes</h3>
          <ul className="feature-list" style={{ padding: 0, marginTop: ".6rem" }}>
            {h.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <hr className="soft" />
          <h3 style={{ fontSize: "1.3rem" }}>Rate this home</h3>
          <p className="muted" style={{ marginTop: "-.2rem", fontSize: ".86rem" }}>
            Tap a star to cast your vote — it counts toward our Awards leaderboard.
          </p>
          <div
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
                onClick={() => {
                  rateHome(h.id, v);
                  toast("Thanks for voting! ★ " + v);
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <aside>
          <div className="side-card">
            <div style={{ textAlign: "center" }}>
              <QRCode seed={"CHECKIN-" + h.id} style={{ margin: "0 auto" }} />
              <p style={{ fontSize: ".78rem", fontWeight: 700, margin: ".7rem 0 .2rem" }}>
                Check-In Code
              </p>
              <p className="muted" style={{ fontSize: ".74rem", margin: "0 0 1rem" }}>
                Scan at the door or tap below to record your visit.
              </p>
              <button
                className={"btn " + (isVisited ? "btn-outline" : "btn-gold") + " btn-block"}
                disabled={isVisited}
                onClick={() => {
                  if (!isVisited) {
                    checkIn(h.id);
                    toast("✓ Checked in at " + h.name + "!");
                  }
                }}
              >
                {isVisited ? "✓ Already Checked In" : "📍 Check In Here"}
              </button>
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: ".6rem" }}
                onClick={() => {
                  toggleRoute(h.id);
                  toast(inRoute ? "Removed from route" : "Added to your route");
                }}
              >
                {inRoute ? "★ In My Route" : "+ Add to Route"}
              </button>
            </div>
            <hr className="soft" />
            <h4 style={{ fontSize: ".95rem" }}>Builder</h4>
            <div style={{ display: "flex", gap: ".7rem", alignItems: "center", margin: ".5rem 0" }}>
              <span
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
              >
                {b?.initials}
              </span>
              <div>
                <b style={{ fontSize: ".92rem" }}>{b?.name}</b>
                <div className="muted" style={{ fontSize: ".78rem" }}>
                  {b?.years} yrs · {b?.phone}
                </div>
              </div>
            </div>
            <Link
              href="/builders"
              className="btn btn-navy btn-block btn-sm"
              style={{ marginTop: ".4rem" }}
            >
              View Builder
            </Link>
          </div>
        </aside>
      </div>

      <section className="block" style={{ paddingBottom: "1rem" }}>
        <div className="row-head">
          <h2 style={{ fontSize: "1.5rem" }}>You may also like</h2>
          <Link href={`/neighborhood/${n?.id}`} className="btn btn-outline btn-sm">
            More in {n?.name} →
          </Link>
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
