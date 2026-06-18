"use client";

import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import type { Sponsor } from "@/lib/types";

import brand1 from "../../../assets/brand1.webp";
import brand2 from "../../../assets/brand2.png";
import brand3 from "../../../assets/brand3.webp";
import brand4 from "../../../assets/brand4.png";
import brand5 from "../../../assets/brand5.jpg";
import brand6 from "../../../assets/brand6.png";
import brand7 from "../../../assets/brand7.jpg";

const sponsorBrands = [brand1, brand2, brand3, brand4, brand5, brand6, brand7];

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
              {list.map((s, idx) => {
                const brandImage = sponsorBrands[db.sponsors.indexOf(s) % sponsorBrands.length];
                return (
                  <div 
                    key={s.id} 
                    className="premium-sponsor-card" 
                    style={{ animationDelay: `${idx * 0.08}s, ${idx * 0.35}s` }}
                  >
                    <div style={{ height: sizeSettings.logoHeight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem", width: "100%" }}>
                      <Image
                        src={brandImage}
                        alt={s.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <b style={{ fontSize: sizeSettings.nameSize, color: "var(--navy)", fontWeight: 600 }}>{s.name}</b>
                    <div
                      className="muted"
                      style={{ fontSize: sizeSettings.catSize, marginTop: ".15rem" }}
                    >
                      {s.cat}
                    </div>
                  </div>
                );
              })}
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
