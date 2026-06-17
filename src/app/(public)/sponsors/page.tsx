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
          The Parade of Homes is made possible by the generous support of these
          local businesses.
        </p>
      </div>
      {tiers.map(([t, label, cls]) => {
        const list = db.sponsors.filter((s) => s.tier === t);
        if (!list.length) return null;
        const cols =
          t === "platinum" ? "grid-2" : t === "gold" ? "grid-3" : "grid-4";
        return (
          <div key={t} className={`tier ${cls}`}>
            <div className="tier-head">
              <span className="ribbon">{label}</span>
            </div>
            <div className={cols}>
              {list.map((s) => (
                <div key={s.id} className="sponsor-card">
                  <div className="slogo" style={{ background: s.color }}>
                    {s.name[0]}
                  </div>
                  <b style={{ fontSize: "1.05rem" }}>{s.name}</b>
                  <div
                    className="muted"
                    style={{ fontSize: ".8rem", marginTop: ".2rem" }}
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
          <Link href="/submit" className="btn btn-navy">
            Become a Sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
