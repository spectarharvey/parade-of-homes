"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { homePhoto } from "@/lib/format";
import { isPremierHome, LEAD_BUILDER_ID, SLIDER_HOME_LIMIT } from "@/lib/builderTier";
import BuilderLogo from "@/components/BuilderLogo";
import HomeCard from "@/components/HomeCard";
import { useCms } from "@/lib/cms/context";

export default function HomePage() {
  const { db, ready, guestUser } = useStore();
  const cms = useCms("home");
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const fbHomes = fb ? db.homes.filter((h) => h.builder === fb.id) : [];
  const fbHero = fbHomes[0] ? homePhoto(fbHomes[0], 1600) : "";
  
  // The "Get Inspired" slider showcases PREMIER-tier homes only. Within those,
  // lead with the pinned builder, then featured homes, then pad with the rest.
  const premierHomes = db.homes.filter((h) =>
    isPremierHome(h, db.builders.find((b) => b.id === h.builder)),
  );
  const isLead = (h: (typeof premierHomes)[number]) => h.builder === LEAD_BUILDER_ID;
  const featured = [
    ...premierHomes.filter(isLead),
    ...premierHomes.filter((h) => !isLead(h) && h.featured),
    ...premierHomes.filter((h) => !isLead(h) && !h.featured),
  ].slice(0, SLIDER_HOME_LIMIT);
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
          <span className="hero-dates">{cms.t("hero.dates")}</span>
          <h1>
            {cms.t("hero.title.line1")}
            <br />
            <span className="gold">{cms.t("hero.title.line2")}</span>
          </h1>
          <p className="lede">{cms.t("hero.lede")}</p>
          <div className="cta-row">
            <Link href={cms.t("hero.cta1.href")} className="btn btn-gold">
              {cms.t("hero.cta1.label")}
            </Link>
            <Link href={cms.t("hero.cta2.href")} className="btn btn-ghost">
              {cms.t("hero.cta2.label")}
            </Link>
          </div>
        </div>
      </section>

      <CountdownTimer />

      {fb && (
        <section className="block">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">{cms.t("featured.eyebrow")}</span>
              <h2>{cms.t("featured.title")}</h2>
            </div>
            <div className="featured-builder">
              <div className="left">
                <BuilderLogo builder={fb} className="blogo" />
                <span className="badge badge-gold">{cms.t("featured.badge")}</span>
                <h3>{fb.name}</h3>
                <p>{fb.blurb}</p>
                <div className="adbox">{fb.ad}</div>
                <Link href={`/builders/${fb.id}`} className="btn btn-gold btn-sm">
                  {cms.t("featured.cta")}
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
                    <span className="badge badge-gold">{cms.t("featured.pendingBadge")}</span>
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
              <span className="badge badge-navy home-badge">{cms.t("contest.badge")}</span>
              <h2>{cms.t("contest.title")}</h2>
              <p>{cms.t("contest.body")}</p>
              {/* Nothing to prompt once a visitor is signed in — and held back
                  until the store resolves the session so it can't flash at them. */}
              {ready && !guestUser && (
                <p className="contest-registration-note">
                  {cms.t("contest.note.text")}{" "}
                  <Link href="/register?tab=login" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>
                    {cms.t("contest.note.loginLabel")}
                  </Link>{" "}
                  or{" "}
                  <Link href="/register" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>
                    {cms.t("contest.note.registerLabel")}
                  </Link>
                  .
                </p>
              )}
            </div>
            <div>
              <Link href="/contest" className="btn btn-navy">
                {cms.t("contest.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
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
              <span className="eyebrow">{cms.t("inspired.eyebrow")}</span>
              <h2>{cms.t("inspired.title")}</h2>
            </div>
            <Link href="/homes" className="btn btn-outline btn-sm">
              {cms.t("inspired.cta")}
            </Link>
          </div>
          <div className="featured-slider-container">
            <div
              className="featured-slider-track"
              ref={trackRef}
              onScroll={handleScroll}
              style={isMobile ? undefined : { transform: `translateX(-${Math.min(activeIdx, maxFeaturedIndex) * 33.333333}%)` }}
            >
              {featured.map((h, i) => (
                <div key={h.id} className="featured-slider-card-wrapper">
                  <HomeCard home={h} priority={i < 3} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="range-line-container">
            <div className="range-line-bar" style={{ width: `${barWidth}%` }}></div>
          </div>
        </div>
      </section>
      )}

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
            {cms.t("sponsors.title")}
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
              {cms.t("sponsors.cta")}
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
  const cms = useCms("home");
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
    { n: t.d, l: cms.t("countdown.days") },
    { n: t.h, l: cms.t("countdown.hours") },
    { n: t.m, l: cms.t("countdown.minutes") },
    { n: t.s, l: cms.t("countdown.seconds") },
  ];

  return (
    <div className="statsbar countdown">
      <div className="wrap">
        <div className="cd-title">
          {t.done ? cms.t("countdown.doneTitle") : cms.t("countdown.title")}
        </div>
        <div className="grid">
          {cells.map((c, i) => (
            <div className="stat" key={i}>
              <div className="num">{mounted ? String(c.n).padStart(2, "0") : "––"}</div>
              <div className="lbl">{c.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
