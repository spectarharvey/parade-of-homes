"use client";

import Link from "next/link";
import BuilderLogo from "@/components/BuilderLogo";
import { useCms } from "@/lib/cms/context";

const FEATURED_BUILDER = {
  id: "b_brije",
  name: "Brije Homes",
  website: "https://www.brije.com/",
};

export default function EventCalendarPage() {
  const cms = useCms("event");

  // Label/value pairs for the key-dates panel, in display order. Written out
  // key by key so the Website Content check can match them 1:1 to the schema.
  const facts = [
    { label: cms.t("facts.1.label"), value: cms.lines("facts.1.value") },
    { label: cms.t("facts.2.label"), value: cms.lines("facts.2.value") },
    { label: cms.t("facts.3.label"), value: cms.lines("facts.3.value") },
    { label: cms.t("facts.4.label"), value: cms.lines("facts.4.value") },
  ];

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="crumb">
        <Link href="/">{cms.t("global.crumb.home")}</Link> / {cms.t("crumb")}
      </div>

      {/* Hero */}
      <div className="sec-head">
        <span className="eyebrow">{cms.t("head.eyebrow")}</span>
        <h2>{cms.t("head.title")}</h2>
        <p style={{ fontSize: "1.02rem" }}>{cms.t("head.blurb")}</p>
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
        {facts.map(({ label, value }, i) => (
          <div key={i}>
            <div className="muted" style={{ fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {label}
            </div>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginTop: ".2rem", whiteSpace: "pre-line" }}>{value}</div>
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <BuilderLogo
            builder={FEATURED_BUILDER}
            className="builder-mini-logo"
            style={{
              width: 68,
              height: 68,
              borderRadius: 12,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              padding: ".45rem",
              flexShrink: 0,
            }}
          />
          <div>
            <span className="badge badge-gold">{cms.t("featured.badge")}</span>
            <h3 style={{ fontSize: "1.25rem", marginTop: ".5rem" }}>{cms.t("featured.name")}</h3>
            <p className="muted" style={{ margin: ".2rem 0 0" }}>{cms.t("featured.blurb")}</p>
          </div>
        </div>
        <Link href={`/builders/${FEATURED_BUILDER.id}`} className="btn btn-outline">
          {cms.t("featured.cta")}
        </Link>
      </div>

      {/* Public visitor CTAs */}
      <div
        className="contest-cta"
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>{cms.t("plan.title")}</h2>
          <p>{cms.t("plan.body")}</p>
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link href="/homes" className="btn btn-navy">
            {cms.t("plan.cta1")}
          </Link>
          <Link href="/map" className="btn btn-navy">
            {cms.t("plan.cta2")}
          </Link>
          <Link href="/register" className="btn btn-gold">
            {cms.t("plan.cta3")}
          </Link>
        </div>
      </div>
    </div>
  );
}
