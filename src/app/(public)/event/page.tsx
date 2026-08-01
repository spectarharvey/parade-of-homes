"use client";

import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  badge?: string;
  bullets: string[];
  cta?: { href: string; label: string };
  sold?: boolean;
};

const BUILDER_TIERS: Tier[] = [
  {
    name: "Featured Builder Entry",
    price: "$10,000",
    badge: "Members only",
    sold: true,
    bullets: [
      "1 model home full-page entry in the Parade of Homes magazine with “Featured Builder” recognition.",
      "Home location featured on the Parade of Homes map with “Featured Builder” indicated.",
      "3 additional full-page ads inside the magazine ($6,000 value).",
      "Your home and logo featured on the front cover of the Parade of Homes Magazine.",
      "Logo prominently featured in the “Premier Builders” page of the magazine.",
      "Logo AND home prominently featured on the main website landing page.",
      "Featured on MCBIA social media, the kick-off event, and the Awards Dinner.",
      "“Featured Builder” yard sign to place at your model home.",
    ],
  },
  {
    name: "Premier Builder Entry",
    price: "$5,000",
    bullets: [
      "1 model home full-page entry in the magazine with “Premier Builder” recognition.",
      "Home location listed on the Parade of Homes map with “Premier Builder” indicated.",
      "1 additional full-page ad in the magazine ($2,000 value).",
      "Logo in the “Premier Builders” page of the magazine and on the website landing page.",
      "Additional recognition on MCBIA social media, the kick-off event, and the Awards Dinner.",
      "“Premier Builder” yard sign to place at your model home.",
    ],
  },
  {
    name: "Standard Builder Entry",
    price: "$2,500",
    badge: "$3,300 Non-Members (incl. 1-yr membership)",
    bullets: [
      "1 model home full-page entry in the Parade of Homes magazine.",
      "Home location listed on the Parade of Homes map.",
    ],
  },
  {
    name: "Premier Associate Entry",
    price: "$5,000",
    badge: "Associate Members (Non-Builders)",
    bullets: [
      "2 full-page ads in the magazine ($4,000 value).",
      "Logo in the “Premier Associates” page of the magazine and on the website landing page.",
      "Additional recognition at the kick-off event, the Awards Dinner, and on social media.",
    ],
  },
];

const SPONSOR_TIERS: Tier[] = [
  {
    name: "Full Page Ad",
    price: "$2,000",
    bullets: [
      "Your logo featured on the MCBIA website Parade of Homes landing page.",
      "A full-page advertisement in the Parade of Homes magazine.",
    ],
    cta: { href: "/sponsor-entry", label: "Sponsor — Full Page" },
  },
  {
    name: "Half Page Ad",
    price: "$1,200",
    bullets: [
      "Your logo featured on the MCBIA website Parade of Homes landing page.",
      "A half-page advertisement in the Parade of Homes magazine.",
    ],
    cta: { href: "/sponsor-entry", label: "Sponsor — Half Page" },
  },
];

const FEATURED_BUILDER = {
  name: "Brije Homes",
  website: "https://www.brije.com/",
};

export default function EventCalendarPage() {
  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="crumb">
        <Link href="/">Home</Link> / Event Calendar
      </div>

      {/* Hero */}
      <div className="sec-head">
        <span className="eyebrow">Event Calendar</span>
        <h2>2026 Parade of Homes — Entry &amp; Sponsorship</h2>
        <p style={{ fontSize: "1.02rem" }}>
          November 6–8 &amp; 13–15 have been reserved for the MCBIA&apos;s 2026
          Parade of Homes.{" "}
          <strong>Entry deadline is August 7th.</strong>
        </p>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".4rem" }}>
          <Link href="/builder-entry" className="btn btn-navy">
            Builder Entry Form →
          </Link>
          <Link href="/sponsor-entry" className="btn btn-gold">
            Sponsor Form →
          </Link>
        </div>
      </div>

      {/* Quick dates card */}
      <div
        className="panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {[
          ["Parade Weekends", "Nov 6–8 & 13–15, 2026"],
          ["Entry Deadline", "August 7, 2026"],
          ["Featured Builder", FEATURED_BUILDER.name],
          ["Assets Status", "Brije assets pending"],
          ["Location", "Marion County, FL"],
        ].map(([l, v]) => (
          <div key={l}>
            <div className="muted" style={{ fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {l}
            </div>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginTop: ".2rem" }}>{v}</div>
          </div>
        ))}
      </div>

      <div
        className="panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "1rem",
        }}
      >
        <div>
          <span className="badge badge-gold">2026 Featured Builder</span>
          <h3 style={{ fontSize: "1.25rem", marginTop: ".5rem" }}>{FEATURED_BUILDER.name}</h3>
          <p className="muted" style={{ margin: ".2rem 0 0" }}>
            Brije Homes is the Featured Builder for this year. Their home and
            logo assets will be added once received.
          </p>
        </div>
        <a href={FEATURED_BUILDER.website} target="_blank" rel="noreferrer" className="btn btn-outline">
          Visit Brije Homes →
        </a>
      </div>

      {/* Builder entries */}
      <div className="sec-head" style={{ marginTop: "2.2rem" }}>
        <span className="eyebrow">For Builders</span>
        <h2 style={{ fontSize: "1.5rem" }}>Builder Entry Levels</h2>
        <p className="muted">
          You must be a member of MCBIA to enter a house in the Parade of Homes.
        </p>
      </div>
      <div className="tier-grid">
        {BUILDER_TIERS.map((t) => (
          <div key={t.name} className="tier-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".6rem" }}>
              <div>
                <h3>{t.name}</h3>
                <div className="price">{t.price}</div>
                {t.badge && <span className="badge badge-blue" style={{ marginTop: ".3rem" }}>{t.badge}</span>}
              </div>
              {t.sold && <span className="badge badge-gold">SOLD</span>}
            </div>
            <ul className="tier-bullets">
              {t.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <Link
              href="/builder-entry"
              className={"btn btn-block" + (t.sold ? " btn-outline" : " btn-navy")}
              style={{ marginTop: "auto" }}
            >
              {t.sold ? "View on Entry Form" : "Enter This Level →"}
            </Link>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: ".8rem", marginTop: ".8rem" }}>
        A 3% processing fee applies to all credit card payments.
      </p>

      {/* Sponsor */}
      <div className="sec-head" style={{ marginTop: "2.2rem" }}>
        <span className="eyebrow">For Sponsors</span>
        <h2 style={{ fontSize: "1.5rem" }}>Become a Sponsor</h2>
        <p className="muted">
          Each sponsorship includes your logo featured on the MCBIA website Parade
          of Homes landing page and an advertisement (full or half page) in the
          magazine.
        </p>
      </div>
      <div className="tier-grid">
        {SPONSOR_TIERS.map((t) => (
          <div key={t.name} className="tier-card">
            <h3>{t.name}</h3>
            <div className="price">{t.price}</div>
            <ul className="tier-bullets">
              {t.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <Link href={t.cta!.href} className="btn btn-gold btn-block" style={{ marginTop: "auto" }}>
              {t.cta!.label} →
            </Link>
          </div>
        ))}
      </div>

      <div
        className="contest-cta"
        style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
      >
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Ready to take part?</h2>
          <p>
            Complete the Builder Entry Form to showcase a model home, or the
            Sponsor Form to put your brand in front of thousands of motivated
            home shoppers.
          </p>
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link href="/builder-entry" className="btn btn-navy">Builder Entry →</Link>
          <Link href="/sponsor-entry" className="btn btn-gold">Sponsor →</Link>
        </div>
      </div>
    </div>
  );
}
