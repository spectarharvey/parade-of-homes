"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { homePhoto, moneyK } from "@/lib/format";
import { builderLogo } from "@/lib/builderAssets";
import HomeCard from "@/components/HomeCard";

export default function HomePage() {
  const { db, liveStats } = useStore();
  const s = liveStats();
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const fbHomes = fb ? db.homes.filter((h) => h.builder === fb.id) : [];
  const fbLogo = builderLogo(fb);
  const fbHero = fbHomes[0] ? homePhoto(fbHomes[0]) : "";
  
  // Prioritize featured homes, pad to exactly 6 using non-featured homes
  const featured = [
    ...db.homes.filter((h) => h.featured),
    ...db.homes.filter((h) => !h.featured)
  ].slice(0, 6);
  const desktopVisibleCards = 3;
  const maxFeaturedIndex = Math.max(0, featured.length - desktopVisibleCards);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [scrollProgress, setScrollProgress] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setWindowWidth(window.innerWidth);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (maxFeaturedIndex === 0) {
      setActiveIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev >= maxFeaturedIndex ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [isMobile, maxFeaturedIndex]);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    if (scrollWidth - clientWidth <= 0) return;
    setScrollProgress(((scrollLeft + clientWidth) / scrollWidth) * 100);
  };

  const desktopProgress = featured.length
    ? Math.min(
        100,
        ((Math.min(activeIdx, maxFeaturedIndex) + Math.min(desktopVisibleCards, featured.length)) /
          featured.length) *
          100,
      )
    : 0;
  const barWidth = isMobile ? scrollProgress : desktopProgress;

  const [nbActiveIdx, setNbActiveIdx] = useState(0);
  const nbTotal = db.neighborhoods.length;
  const cardsToShow = windowWidth <= 768 ? 1 : windowWidth <= 900 ? 2 : 4;
  const slidePercent = windowWidth <= 768 ? 100 : windowWidth <= 900 ? 50 : 25;
  const nbMax = Math.max(0, nbTotal - cardsToShow);

  const handleNbPrev = () => {
    setNbActiveIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNbNext = () => {
    setNbActiveIdx((prev) => Math.min(nbMax, prev + 1));
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="hero-dates">
            Nov 6-8 &amp; 13-15, 2026 · Fri-Sun
          </span>
          <h1>
            Discover Marion County&apos;s
            <br />
            <span className="gold">Finest New Homes</span>
          </h1>
          <p className="lede">
            Tour award-winning builder showcases, plan your perfect route, vote
            for your favorites, and enter the visitor giveaway.
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
              <div className="num"><AnimatedCounter value={s.homes} /></div>
              <div className="lbl">Showcase Homes</div>
            </div>
            <div className="stat">
              <div className="num"><AnimatedCounter value={s.builders} /></div>
              <div className="lbl">Builders</div>
            </div>
            <div className="stat">
              <div className="num"><AnimatedCounter value={s.checkins} /></div>
              <div className="lbl">Visitor Check-Ins</div>
            </div>
            <div className="stat">
              <div className="num"><AnimatedCounter value={s.visitors} /></div>
              <div className="lbl">Registered Guests</div>
            </div>
          </div>
        </div>
      </div>

      {fb && (
        <section className="block">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Builder Spotlight</span>
              <h2>Featured Builder</h2>
            </div>
            <div className="featured-builder">
              <div className="left">
                <div className={"blogo" + (fbLogo ? " has-image" : "")}>
                  {fbLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fbLogo} alt={`${fb.name} logo`} />
                  ) : (
                    fb.initials
                  )}
                </div>
                <span className="badge badge-gold">★ Featured Builder</span>
                <h3>{fb.name}</h3>
                <p>{fb.blurb}</p>
                <div className="adbox">{fb.ad}</div>
                <Link href="/builders" className="btn btn-gold btn-sm">
                  View Builder Profile
                </Link>
              </div>
              <div
                className={"right" + (!fbHero ? " pending-builder-assets" : "")}
                style={{
                  background: fbHero
                    ? `url('${fbHero}') center/cover`
                    : "linear-gradient(135deg, rgba(17, 103, 153, .95), rgba(10, 28, 48, .98))",
                }}
              >
                {!fbHero ? (
                  <div>
                    <span className="badge badge-gold">Assets pending</span>
                    <b>{fb.name} showcase details coming soon</b>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="contest-cta">
            <div>
              <span className="badge badge-navy home-badge">Win Big</span>
              <h2>Visit homes. Fill your card. Enter the giveaway.</h2>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
              <button 
                onClick={handleNbPrev} 
                disabled={nbActiveIdx === 0}
                className="btn btn-outline btn-sm"
                style={{ padding: "0.4rem 0.8rem", borderRadius: "50%", minWidth: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                ←
              </button>
              <button 
                onClick={handleNbNext} 
                disabled={nbActiveIdx >= nbMax}
                className="btn btn-outline btn-sm"
                style={{ padding: "0.4rem 0.8rem", borderRadius: "50%", minWidth: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                →
              </button>
              <Link href="/neighborhoods" className="btn btn-outline btn-sm">
                All Neighborhoods →
              </Link>
            </div>
          </div>
          <div className="nb-slider-container">
            <div 
              className="nb-slider-track"
              style={{ transform: `translateX(-${nbActiveIdx * slidePercent}%)` }}
            >
              {db.neighborhoods.map((n) => {
                const count = db.homes.filter((h) => h.nb === n.id).length;
                return (
                  <div key={n.id} className="nb-slider-card-wrapper">
                    <Link
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
                  </div>
                );
              })}
            </div>
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
          <div className="featured-slider-container">
            <div
              className="featured-slider-track"
              ref={trackRef}
              onScroll={handleScroll}
              style={isMobile ? undefined : { transform: `translateX(-${Math.min(activeIdx, maxFeaturedIndex) * 33.333333}%)` }}
            >
              {featured.map((h) => (
                <div key={h.id} className="featured-slider-card-wrapper">
                  <HomeCard home={h} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="range-line-container">
            <div className="range-line-bar" style={{ width: `${barWidth}%` }}></div>
          </div>
        </div>
      </section>

      {db.sponsors.length ? (
      <div className="sponsor-bar">
        <div className="wrap">
          <p
            className="center muted"
            style={{
              fontSize: ".85rem",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              fontWeight: 700,
              margin: "0 0 1.5rem",
              color: "var(--navy)",
            }}
          >
            Proudly Supported By Our Sponsors
          </p>
          
          {/* Desktop Grid */}
          <div className="sponsor-grid">
            {db.sponsors.slice(0, 7).map((sponsor) => (
                <div key={sponsor.id} className="sponsor-logo-container">
                  {sponsor.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.img}
                      alt={sponsor.name}
                      className="sponsor-logo-img"
                      style={{ width: "auto", height: "100%", maxHeight: "50px", objectFit: "contain" }}
                    />
                  ) : <b>{sponsor.name}</b>}
                </div>
              ))}
          </div>

          {/* Mobile Marquee */}
          <div className="marquee-container">
            <div className="marquee-content">
              {[...db.sponsors.slice(0, 7), ...db.sponsors.slice(0, 7)].map((sponsor, idx) => (
                  <div key={`${sponsor.id}-${idx}`} className="sponsor-logo-container">
                    {sponsor.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.img}
                        alt={sponsor.name}
                        className="sponsor-logo-img"
                        style={{ width: "auto", height: "100%", maxHeight: "50px", objectFit: "contain" }}
                      />
                    ) : <b>{sponsor.name}</b>}
                  </div>
                ))}
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Link href="/sponsors" className="btn btn-navy btn-sm">
              See all Sponsors
            </Link>
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1500; // Total animation duration in ms
    const increment = Math.max(1, Math.floor(end / 60)); // Stride size
    const stepTime = Math.max(16, Math.floor(duration / (end / increment)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString("en-US")}</>;
}
