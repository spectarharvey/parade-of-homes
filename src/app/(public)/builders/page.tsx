"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { homePhoto } from "@/lib/format";
import BuilderLogo from "@/components/BuilderLogo";
import { Megaphone, Phone, Globe, Award, Home } from "lucide-react";

const siteUrl = (w: string) => (/^https?:\/\//.test(w) ? w : `https://${w}`);
const linkStyle: React.CSSProperties = { color: "inherit", textDecoration: "none" };

export default function BuildersPage() {
  const { db } = useStore();
  const router = useRouter();
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const fbHomes = db.homes.filter((h) => h.builder === fb.id).slice(0, 3);
  const fbHero = fbHomes[0] ? homePhoto(fbHomes[0]) : "";

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Builders
      </div>
      <div className="sec-head">
        <span className="eyebrow">Meet the Makers</span>
        <h2>Participating Builders</h2>
      </div>

      <div className="featured-builder" style={{ marginBottom: "2.4rem" }}>
        <div className="left">
          <BuilderLogo builder={fb} className="blogo" />
          <span className="badge badge-gold">
            ★ Featured Builder of the Parade
          </span>
          <h3>{fb.name}</h3>
          <p>{fb.blurb}</p>
          <div className="adbox" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={16} style={{ color: "var(--navy)", flexShrink: 0 }} />
            <span>{fb.ad}</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1.2rem",
              color: "#c2cdd9",
              fontSize: ".85rem",
              marginBottom: "1rem",
              flexWrap: "wrap"
            }}
          >
            <a
              href={`tel:${fb.phone.replace(/\D/g, "")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", ...linkStyle }}
            >
              <Phone size={14} /> {fb.phone}
            </a>
            <a
              href={siteUrl(fb.website)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", ...linkStyle }}
            >
              <Globe size={14} /> {fb.website}
            </a>
            {fb.years ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Award size={14} /> {fb.years} yrs
              </span>
            ) : null}
          </div>
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
      <div className="grid-2">
        {db.builders.map((b) => {
          const c = db.homes.filter((h) => h.builder === b.id).length;
          return (
            <div
              key={b.id}
              className="card card-hover"
              onClick={() => router.push(`/builders/${b.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/builders/${b.id}`);
              }}
              style={{
                padding: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <BuilderLogo
                builder={b}
                className="builder-mini-logo"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  background: b.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Lora",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: ".5rem",
                  }}
                >
                  <b style={{ fontSize: "1.05rem" }}>{b.name}</b>
                  {b.featured ? (
                    <span className="badge badge-gold">★ Featured</span>
                  ) : null}
                </div>
                <p
                  className="muted"
                  style={{ fontSize: ".85rem", margin: ".3rem 0" }}
                >
                  {b.blurb}
                </p>
                <div className="muted" style={{ fontSize: ".8rem", display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  <a href={`tel:${b.phone.replace(/\D/g, "")}`} onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", ...linkStyle }}><Phone size={13} /> {b.phone}</a>
                  <span>·</span>
                  <a href={siteUrl(b.website)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", ...linkStyle }}><Globe size={13} /> {b.website}</a>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Home size={13} /> {c} {c === 1 ? "home" : "homes"}</span>
                  {b.years ? (
                    <>
                      <span>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Award size={13} /> {b.years} yrs</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
