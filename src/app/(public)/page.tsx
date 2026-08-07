"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { homePhoto } from "@/lib/format";
import BuilderLogo from "@/components/BuilderLogo";
import HomeCard from "@/components/HomeCard";

export default function HomePage() {
  const { db } = useStore();
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const fbHomes = fb ? db.homes.filter((h) => h.builder === fb.id) : [];
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

  // Build a seamless, continuously-rotating reel of sponsor logos. Repeat the
  // sponsor list enough times to comfortably fill wide screens so the loop has
  // no visible gap or jump, even when there are only a couple of sponsors.
  const sponsorReps = db.sponsors.length
    ? Math.max(1, Math.ceil(6 / db.sponsors.length))
    : 0;
  const sponsorReel = Array.from({ length: sponsorReps }, () => db.sponsors).flat();

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

      <CountdownTimer />

      {fb && (
        <section className="block">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Builder Spotlight</span>
              <h2>Featured Builder</h2>
            </div>
            <div className="featured-builder">
              <div className="left">
                <BuilderLogo builder={fb} className="blogo" />
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
              <h2>Tour the homes. Enter to win. Pack your bags!</h2>
              <p>
                Visit at least 8 homes across the two Parade weekends for a chance to win! Enjoy a three-day stay in a Premium Oceanview
                Suite at Hammock Beach Golf Resort &amp; Spa, complete with daily
                breakfast for two at Atlantic Grille. Sponsored by Umpleby
                Travels.
              </p>
              <p className="contest-registration-note">
                You must be registered and logged in to participate in the
                contest.
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
              <span className="eyebrow">Get Inspired</span>
              <h2>by The Parade of Homes</h2>
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
          
          {/* Rotating sponsor logo slider (all breakpoints) */}
          <div className="sponsor-slider">
            <div className="sponsor-slider-track" aria-hidden="true">
              {[...sponsorReel, ...sponsorReel].map((sponsor, idx) => (
                  <div key={`${sponsor.id}-${idx}`} className="sponsor-logo-container">
                    {sponsor.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.img}
                        alt={sponsor.name}
                        className="sponsor-logo-img"
                        style={{ width: "auto", height: "100%", maxHeight: "90px", objectFit: "contain" }}
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

// Parade opening: Fri, Nov 6, 2026 at 11:00 AM ET — the first open-house hour.
// EST (-05:00) is correct: DST ends Sun, Nov 1, 2026, so Nov 6 is standard time.
const PARADE_START = new Date("2026-11-06T11:00:00-05:00").getTime();

function CountdownTimer() {
  const calc = () => {
    const diff = PARADE_START - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const secs = Math.floor(diff / 1000);
    return {
      d: Math.floor(secs / 86400),
      h: Math.floor((secs % 86400) / 3600),
      m: Math.floor((secs % 3600) / 60),
      s: secs % 60,
      done: false,
    };
  };

  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });
  // Compute on the client only to avoid an SSR/hydration mismatch on the seconds.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(calc());
    const timer = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cells = [
    { n: t.d, l: "Days" },
    { n: t.h, l: "Hours" },
    { n: t.m, l: "Minutes" },
    { n: t.s, l: "Seconds" },
  ];

  return (
    <div className="statsbar countdown">
      <div className="wrap">
        <div className="cd-title">
          {t.done ? "The 2026 Parade of Homes is here" : "Countdown to the 2026 Parade of Homes (EST)"}
        </div>
        <div className="grid">
          {cells.map((c) => (
            <div className="stat" key={c.l}>
              <div className="num">{mounted ? String(c.n).padStart(2, "0") : "––"}</div>
              <div className="lbl">{c.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
