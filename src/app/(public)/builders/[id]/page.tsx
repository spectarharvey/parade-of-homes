"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { homePhoto } from "@/lib/format";
import { builderLogo } from "@/lib/builderAssets";
import HomeCard from "@/components/HomeCard";
import NotFoundBlock from "@/components/NotFoundBlock";
import { Phone, Globe, Award } from "lucide-react";

const siteUrl = (w: string) => (/^https?:\/\//.test(w) ? w : `https://${w}`);
const linkStyle: React.CSSProperties = { color: "inherit", textDecoration: "none" };

export default function BuilderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useStore();

  const b = db.builders.find((x) => x.id === id);
  if (!b) return <NotFoundBlock />;

  const homes = db.homes.filter((h) => h.builder === b.id);
  const logo = builderLogo(b);
  const hero = homes[0] ? homePhoto(homes[0]) : "";

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / <Link href="/builders">Builders</Link> /{" "}
        {b.name}
      </div>

      <div className="featured-builder" style={{ margin: "1rem 0 2.4rem" }}>
        <div className="left">
          <div className={"blogo" + (logo ? " has-image" : "")}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={`${b.name} logo`} />
            ) : (
              b.initials
            )}
          </div>
          {b.featured ? (
            <span className="badge badge-gold">★ Featured Builder of the Parade</span>
          ) : null}
          <h3>{b.name}</h3>
          <p>{b.blurb}</p>
          {b.ad ? <div className="adbox">{b.ad}</div> : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              color: "#c2cdd9",
              fontSize: ".9rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href={`tel:${b.phone.replace(/\D/g, "")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", ...linkStyle }}
            >
              <Phone size={15} /> {b.phone}
            </a>
            <a
              href={siteUrl(b.website)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", ...linkStyle }}
            >
              <Globe size={15} /> {b.website}
            </a>
            {b.years ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Award size={15} /> {b.years} yrs
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={"right" + (!hero ? " pending-builder-assets" : "")}
          style={{
            background: hero
              ? `url('${hero}') center/cover`
              : "linear-gradient(135deg, rgba(17, 103, 153, .95), rgba(10, 28, 48, .98))",
          }}
        >
          {!hero ? (
            <div>
              <span className="badge badge-gold">Assets pending</span>
              <b>{b.name} showcase details coming soon</b>
            </div>
          ) : null}
        </div>
      </div>

      {homes.length ? (
        <>
          <div className="row-head">
            <h3 style={{ fontSize: "1.3rem" }}>Homes by {b.name}</h3>
          </div>
          <div className="grid-3">
            {homes.map((h) => (
              <HomeCard key={h.id} home={h} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty">No showcase homes listed yet.</div>
      )}
    </div>
  );
}
