"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { moneyK } from "@/lib/format";
import HomeCard from "@/components/HomeCard";

export default function HomePage() {
  const { db, liveStats } = useStore();
  const s = liveStats();
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const featured = db.homes.filter((h) => h.featured).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="hero-dates">
            Three weekends this Fall · Fri–Sun · 10am–5pm
          </span>
          <h1>
            Discover Marion County&apos;s
            <br />
            <span className="gold">Finest New Homes</span>
          </h1>
          <p className="lede">
            Tour award-winning builder showcases, plan your perfect route, vote
            for your favorites, and enter to win the grand prize.
          </p>
          <div className="cta-row">
            <Link href="/homes" className="btn btn-gold">
              Browse Homes
            </Link>
            <Link href="/map" className="btn btn-ghost">
              Plan My Route →
            </Link>
          </div>
        </div>
      </section>

      <div className="statsbar">
        <div className="wrap">
          <div className="grid">
            <div className="stat">
              <div className="num">{s.homes}</div>
              <div className="lbl">Showcase Homes</div>
            </div>
            <div className="stat">
              <div className="num">{s.builders}</div>
              <div className="lbl">Featured Builders</div>
            </div>
            <div className="stat">
              <div className="num">{s.checkins.toLocaleString("en-US")}</div>
              <div className="lbl">Visitor Check-Ins</div>
            </div>
            <div className="stat">
              <div className="num">{s.visitors.toLocaleString("en-US")}</div>
              <div className="lbl">Registered Guests</div>
            </div>
          </div>
        </div>
      </div>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Builder Spotlight</span>
            <h2>Featured Builder</h2>
          </div>
          <div className="featured-builder">
            <div className="left">
              <div className="blogo">{fb.initials}</div>
              <span className="badge badge-gold">★ Featured Builder</span>
              <h3>{fb.name}</h3>
              <p>{fb.blurb}</p>
              <div className="adbox">📣 {fb.ad}</div>
              <Link href="/builders" className="btn btn-gold btn-sm">
                View Builder Profile
              </Link>
            </div>
            <div className="right"></div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="contest-cta">
            <div>
              <span className="badge badge-navy">🏆 Win Big</span>
              <h2>Visit homes. Fill your card. Win the grand prize.</h2>
              <p>
                Check in at {db.contest.target} showcase homes to be
                automatically entered. {db.contest.prize}
              </p>
            </div>
            <div>
              <Link href="/contest" className="btn btn-navy">
                Track My Progress
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="row-head">
            <div>
              <span className="eyebrow">Explore by Area</span>
              <h2>Neighborhoods</h2>
            </div>
            <Link href="/neighborhoods" className="btn btn-outline btn-sm">
              All Neighborhoods →
            </Link>
          </div>
          <div className="grid-4">
            {db.neighborhoods.map((n) => {
              const count = db.homes.filter((h) => h.nb === n.id).length;
              return (
                <Link
                  key={n.id}
                  href={`/neighborhood/${n.id}`}
                  className="nb-card"
                >
                  <span
                    className="bg"
                    style={{ backgroundImage: `url('${n.img}')` }}
                  ></span>
                  <span className="nb-body">
                    <span
                      className="badge"
                      style={{
                        background: "rgba(255,255,255,.18)",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <span
                        className="dot"
                        style={{ background: n.color }}
                      ></span>
                      {n.city}
                    </span>
                    <h3>{n.name}</h3>
                    <span className="nb-meta">
                      <span>{count} homes</span>
                      <span>
                        {moneyK(n.low)}–{moneyK(n.high)}
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="block"
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="wrap">
          <div className="row-head">
            <div>
              <span className="eyebrow">Don&apos;t Miss These</span>
              <h2>Featured Listings</h2>
            </div>
            <Link href="/homes" className="btn btn-outline btn-sm">
              View All Homes →
            </Link>
          </div>
          <div className="grid-3">
            {featured.map((h) => (
              <HomeCard key={h.id} home={h} />
            ))}
          </div>
        </div>
      </section>

      <div className="sponsor-bar">
        <div className="wrap">
          <p
            className="center muted"
            style={{
              fontSize: ".74rem",
              textTransform: "uppercase",
              letterSpacing: ".16em",
              fontWeight: 700,
              margin: "0 0 1rem",
            }}
          >
            Proudly Supported By Our Sponsors
          </p>
          <div className="sponsor-logos">
            {db.sponsors.slice(0, 7).map((sp) => (
              <span key={sp.id} className="sponsor-chip">
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: sp.color,
                    display: "inline-block",
                  }}
                ></span>
                {sp.name}
              </span>
            ))}
            <Link
              href="/sponsors"
              className="sponsor-chip"
              style={{ borderStyle: "dashed", color: "var(--gold-dark)" }}
            >
              + See all sponsors
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
