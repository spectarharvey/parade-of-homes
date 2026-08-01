"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Sponsor } from "@/lib/types";

const tiers: [Sponsor["tier"], string, string][] = [
  ["platinum", "Platinum Sponsors", "tier-platinum"],
  ["gold", "Gold Sponsors", "tier-gold"],
  ["silver", "Silver Sponsors", "tier-silver"],
];

export default function SponsorsPage() {
  const { db } = useStore();

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Sponsors
      </div>
      <div className="sec-head">
        <span className="eyebrow">Thank You</span>
        <h2>Our Sponsors</h2>
        <p>
          The 2026 sponsor list will be added as sponsorships are confirmed.
        </p>
      </div>
      {!db.sponsors.length ? (
        <div className="panel" style={{ textAlign: "center", color: "var(--muted)", marginBottom: "1.4rem" }}>
          Sponsor logos and ads are coming soon.
        </div>
      ) : null}
      {tiers.map(([t, label, cls]) => {
        const list = db.sponsors.filter((s) => s.tier === t);
        if (!list.length) return null;
        
        const sizeSettings = {
          platinum: { logoHeight: "80px", nameSize: "1rem", catSize: "0.78rem", minColWidth: "180px" },
          gold: { logoHeight: "65px", nameSize: "0.9rem", catSize: "0.74rem", minColWidth: "150px" },
          silver: { logoHeight: "50px", nameSize: "0.8rem", catSize: "0.7rem", minColWidth: "120px" },
        }[t];

        return (
          <div key={t} className={`tier ${cls}`}>
            <div className="tier-head">
              <span className="ribbon">{label}</span>
            </div>
            <div 
              className="premium-sponsor-grid" 
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${sizeSettings.minColWidth}, 1fr))` }}
            >
              {list.map((s, idx) => (
                  <div 
                    key={s.id} 
                    className="premium-sponsor-card" 
                    style={{ animationDelay: `${idx * 0.08}s, ${idx * 0.35}s` }}
                  >
                    <div style={{ height: sizeSettings.logoHeight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem", width: "100%" }}>
                      {s.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.img}
                          alt={s.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      ) : <b style={{ color: "var(--navy)", textAlign: "center" }}>{s.name}</b>}
                    </div>
                    <b style={{ fontSize: sizeSettings.nameSize, color: "var(--navy)", fontWeight: 600 }}>{s.name}</b>
                    <div
                      className="muted"
                      style={{ fontSize: sizeSettings.catSize, marginTop: ".15rem" }}
                    >
                      {s.cat}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
      <div className="contest-cta" style={{ marginTop: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem" }}>Want to sponsor the Parade?</h2>
          <p>
            Put your brand in front of thousands of motivated home shoppers
            across Marion County.
          </p>
        </div>
        <div>
          <Link href="/sponsor-entry" className="btn btn-navy">
            Become a Sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
