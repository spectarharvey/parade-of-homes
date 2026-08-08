"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import BuilderLogo from "@/components/BuilderLogo";
import type { Sponsor } from "@/lib/types";

const tiers: [Sponsor["tier"], string, string][] = [
  ["platinum", "Platinum Sponsors", "tier-platinum"],
  ["gold", "Gold Sponsors", "tier-gold"],
  ["silver", "Silver Sponsors", "tier-silver"],
];

const hasSponsorDetails = (sponsor: Sponsor) =>
  Boolean(sponsor.website || sponsor.phone || sponsor.email || sponsor.address);

const externalUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export default function SponsorsPage() {
  const { db } = useStore();
  const fb = db.builders.find((b) => b.featured);

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
          platinum: { logoHeight: "96px", minColWidth: "200px" },
          gold: { logoHeight: "76px", minColWidth: "170px" },
          silver: { logoHeight: "60px", minColWidth: "140px" },
        }[t];
        const minColWidth = list.some(hasSponsorDetails)
          ? "280px"
          : sizeSettings.minColWidth;

        return (
          <div key={t} className={`tier ${cls}`}>
            <div className="tier-head">
              <span className="ribbon">{label}</span>
            </div>
            <div
              className="premium-sponsor-grid"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}, 1fr))` }}
            >
              {list.map((s, idx) => (
                <div
                  key={s.id}
                  className={`premium-sponsor-card${hasSponsorDetails(s) ? " premium-sponsor-card--details" : ""}`}
                  style={{ animationDelay: `${idx * 0.08}s, ${idx * 0.35}s` }}
                  title={s.name}
                >
                  <div
                    className="premium-sponsor-logo"
                    style={{ height: sizeSettings.logoHeight }}
                  >
                    {s.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.img} alt={s.name} />
                    ) : (
                      <b style={{ color: "var(--navy)", textAlign: "center" }}>{s.name}</b>
                    )}
                  </div>
                  {hasSponsorDetails(s) ? (
                    <div className="premium-sponsor-details">
                      <h3>{s.name}</h3>
                      {s.cat ? <p className="premium-sponsor-category">{s.cat}</p> : null}
                      <div className="premium-sponsor-contact">
                        {s.phone ? <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a> : null}
                        {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : null}
                        {s.address ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {s.address}
                          </a>
                        ) : null}
                      </div>
                      {s.website ? (
                        <a
                          href={externalUrl(s.website)}
                          className="btn btn-outline btn-sm"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit Website ↗
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {fb ? (
        <div
          className="panel"
          style={{
            display: "flex",
            gap: "1.4rem",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: "1.4rem",
            borderLeft: "4px solid var(--gold)",
          }}
        >
          <BuilderLogo
            builder={fb}
            className="sponsor-featured-logo"
            style={{
              width: 130,
              minWidth: 130,
              height: 96,
              display: "grid",
              placeItems: "center",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid var(--line)",
              padding: ".6rem",
            }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span className="badge badge-gold">★ 2026 Featured Builder</span>
            <p style={{ margin: ".6rem 0 .9rem", fontSize: ".98rem", lineHeight: 1.55 }}>
              A special thank you to our 2026 Featured Builder,{" "}
              <b>Brije Homes</b>, for helping make this year&apos;s Parade of
              Homes possible! Brije Homes is an award-winning custom home builder
              serving Central Florida with a design-first, client-focused
              building process.
            </p>
            <Link href={`/builders/${fb.id}`} className="btn btn-gold btn-sm">
              View Brije Homes →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
