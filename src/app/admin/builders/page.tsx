"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";

export default function AdminBuildersPage() {
  const { db, setFeaturedBuilder, saveBuilderAd } = useStore();
  const { toast } = useToast();
  const [adText, setAdText] = useState<Record<string, string>>(() =>
    Object.fromEntries(db.builders.map((b) => [b.id, b.ad]))
  );

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Builder Manager</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Set the featured builder and edit each builder&apos;s profile ad space.
      </p>
      <div className="grid-2" style={{ marginTop: "1.2rem" }}>
        {db.builders.map((b) => (
          <div className="panel" key={b.id}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "11px",
                  background: b.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Lora",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {b.initials}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <b>{b.name}</b>
                  {b.featured ? (
                    <span className="badge badge-gold">★ Featured</span>
                  ) : (
                    <button
                      className="ico-btn"
                      onClick={() => {
                        setFeaturedBuilder(b.id);
                        toast("Featured builder updated");
                      }}
                    >
                      Set Featured
                    </button>
                  )}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: ".8rem", margin: ".2rem 0" }}
                >
                  {db.homes.filter((h) => h.builder === b.id).length} homes ·{" "}
                  {b.phone}
                </div>
                <div className="fld" style={{ marginTop: ".6rem" }}>
                  <label>Ad Space Text</label>
                  <textarea
                    rows={2}
                    value={adText[b.id] ?? ""}
                    onChange={(e) =>
                      setAdText((prev) => ({ ...prev, [b.id]: e.target.value }))
                    }
                  />
                </div>
                <button
                  className="ico-btn"
                  style={{ marginTop: ".5rem" }}
                  onClick={() => {
                    saveBuilderAd(b.id, adText[b.id] ?? "");
                    toast("Ad text saved");
                  }}
                >
                  Save Ad Text
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
