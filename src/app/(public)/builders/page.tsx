"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { homePhoto } from "@/lib/format";
import { builderLogo } from "@/lib/builderAssets";
import HomeCard from "@/components/HomeCard";
import { Megaphone, Phone, Globe, Award, Home } from "lucide-react";

export default function BuildersPage() {
  const { db } = useStore();
  const fb = db.builders.find((b) => b.featured) || db.builders[0];
  const fbHomes = db.homes.filter((h) => h.builder === fb.id).slice(0, 3);
  const fbLogo = builderLogo(fb);
  const fbHero = fbHomes[0] ? homePhoto(fbHomes[0]) : "";

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Builders
      </div>
      <div className="sec-head">
        <span className="eyebrow">Meet the Makers</span>
        <h2>Featured Builders</h2>
      </div>

      <div
        className="card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1.2rem 1.5rem",
          marginBottom: "2.4rem",
          background: "var(--navy)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
          <Home size={22} />
          <div>
            <b style={{ fontSize: "1.05rem" }}>Are you a builder?</b>
            <div style={{ fontSize: ".86rem", color: "#d8e2ec" }}>
              Log in to post your homes and manage your profile — your listings
              appear here under your name.
            </div>
          </div>
        </div>
        <Link href="/builder" className="btn btn-gold btn-sm">
          Builder Login →
        </Link>
      </div>

      <div className="featured-builder" style={{ marginBottom: "2.4rem" }}>
        <div className="left">
          <div className={"blogo" + (fbLogo ? " has-image" : "")}>
            {fbLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fbLogo} alt={`${fb.name} logo`} />
            ) : (
              fb.initials
            )}
          </div>
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Phone size={14} /> {fb.phone}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Globe size={14} /> {fb.website}
            </span>
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
      {fbHomes.length ? (
        <>
          <div className="row-head">
            <h3 style={{ fontSize: "1.3rem" }}>Homes by {fb.name}</h3>
          </div>
          <div className="grid-3" style={{ marginBottom: "2.6rem" }}>
            {fbHomes.map((h) => (
              <HomeCard key={h.id} home={h} />
            ))}
          </div>
        </>
      ) : null}
      <div className="sec-head left" style={{ maxWidth: "none" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Builder Directory</h2>
      </div>
      <div className="grid-2">
        {db.builders.map((b) => {
          const c = db.homes.filter((h) => h.builder === b.id).length;
          const logo = builderLogo(b);
          return (
            <div
              key={b.id}
              className="card"
              style={{
                padding: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <span
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
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={`${b.name} logo`} />
                ) : (
                  b.initials
                )}
              </span>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Phone size={13} /> {b.phone}</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Globe size={13} /> {b.website}</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Home size={13} /> {c} homes</span>
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
