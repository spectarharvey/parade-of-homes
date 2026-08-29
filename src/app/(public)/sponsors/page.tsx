"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import BuilderLogo from "@/components/BuilderLogo";
import type { Sponsor } from "@/lib/types";
import { useCms } from "@/lib/cms/context";

// [tier, Website Content key for the ribbon, css class]
const tiers: [Sponsor["tier"], string, string][] = [
  ["platinum", "tier.platinum", "tier-platinum"],
  ["gold", "tier.gold", "tier-gold"],
  ["silver", "tier.silver", "tier-silver"],
];

const hasSponsorDetails = (sponsor: Sponsor) =>
  Boolean(sponsor.website || sponsor.phone || sponsor.email || sponsor.address);

const externalUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export default function SponsorsPage() {
  const { db } = useStore();
  const cms = useCms("sponsors");
  const fb = db.builders.find((b) => b.featured);

  // The Featured Builder (Brije Homes) is showcased in the banner below and must
  // never also appear as a sponsor card — drop any sponsor with the same name so
  // a duplicate can't sneak back in via the admin.
  const fbName = fb?.name.trim().toLowerCase();
  const sponsors = fbName
    ? db.sponsors.filter((s) => s.name.trim().toLowerCase() !== fbName)
    : db.sponsors;

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">{cms.t("global.crumb.home")}</Link> / {cms.t("crumb")}
      </div>
      <div className="sec-head">
        <span className="eyebrow">{cms.t("head.eyebrow")}</span>
        <h2>{cms.t("head.title")}</h2>
        <p>{cms.t("head.blurb")}</p>
      </div>

      {fb ? (
        <div className="tier">
          <div
            className="panel"
            style={{
              position: "relative",
              display: "flex",
              gap: "1.4rem",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "1.6rem",
              borderLeft: "4px solid var(--gold)",
            }}
          >
            {/* Featured Builder badge sits on the card itself, not as a section header. */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translate(-50%, -50%)",
                whiteSpace: "nowrap",
                display: "inline-block",
                padding: ".4rem 1.4rem",
                borderRadius: "50px",
                fontWeight: 800,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontSize: ".8rem",
                background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
                color: "var(--navy-deep)",
                boxShadow: "var(--shadow)",
                zIndex: 2,
              }}
            >
              {cms.t("featured.badge")}
            </span>
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
              <p style={{ margin: ".2rem 0 .9rem", fontSize: ".98rem", lineHeight: 1.55 }}>
                {cms.t("featured.body.prefix")}{" "}
                <b>{cms.t("featured.body.name")}</b>
                {cms.t("featured.body.suffix")}
              </p>
              <Link href={`/builders/${fb.id}`} className="btn btn-gold btn-sm">
                {cms.t("featured.cta")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {!sponsors.length ? (
        <div className="panel" style={{ textAlign: "center", color: "var(--muted)", marginBottom: "1.4rem" }}>
          {cms.t("empty")}
        </div>
      ) : null}
      {tiers.map(([t, labelKey, cls]) => {
        const list = sponsors.filter((s) => s.tier === t);
        if (!list.length) return null;

        const sizeSettings = {
          platinum: { logoHeight: "96px", minColWidth: "200px" },
          gold: { logoHeight: "76px", minColWidth: "170px" },
          silver: { logoHeight: "60px", minColWidth: "140px" },
        }[t];
        const minColWidth = list.some(hasSponsorDetails)
          ? "310px"
          : sizeSettings.minColWidth;

        return (
          <div key={t} className={`tier ${cls}`}>
            <div className="tier-head">
              <span className="ribbon">{cms.t(labelKey)}</span>
            </div>
            <div className="premium-sponsor-grid">
              {list.map((s, idx) => (
                <div
                  key={s.id}
                  className={`premium-sponsor-card${hasSponsorDetails(s) ? " premium-sponsor-card--details" : ""}`}
                  style={{
                    animationDelay: `${idx * 0.08}s, ${idx * 0.35}s`,
                    width: "100%",
                    maxWidth: minColWidth,
                    flex: `1 1 ${minColWidth}`,
                  }}
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
                          {cms.t("card.websiteLabel")}
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
    </div>
  );
}
