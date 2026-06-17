"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import { money, stars, homePhoto } from "@/lib/format";

export default function MapPage() {
  const { db, home, nbhd, route, toggleRoute, removeRouteStop, clearRoute } =
    useStore();
  const { toast } = useToast();
  const [routeMode, setRouteMode] = useState(false);
  const [popupId, setPopupId] = useState<string | null>(null);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> / Map &amp; Route
      </div>
      <div className="row-head">
        <div>
          <span className="eyebrow">Plan Your Visit</span>
          <h2>Interactive Map</h2>
          <p className="muted">
            Color-coded by neighborhood. Click a pin to preview a home, or build
            a numbered route.
          </p>
        </div>
        <button
          className={"btn btn-sm " + (routeMode ? "btn-navy" : "btn-gold")}
          onClick={() => {
            setRouteMode((m) => !m);
            setPopupId(null);
          }}
        >
          {routeMode ? "✓ Route Mode On" : "🧭 Plan My Route"}
        </button>
      </div>
      <div className="map-layout">
        <div className="map-side">
          {!routeMode ? (
            <div>
              <h4 style={{ fontSize: ".95rem" }}>Neighborhoods</h4>
              {db.neighborhoods.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    fontSize: ".84rem",
                    marginBottom: ".4rem",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: n.color,
                    }}
                  ></span>
                  {n.name}
                </div>
              ))}
              <hr className="soft" />
              <p className="muted" style={{ fontSize: ".82rem" }}>
                💡 Tip: turn on <b>Plan My Route</b>, then click pins in the order
                you want to visit. We&apos;ll number your stops.
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ fontSize: ".95rem", margin: 0 }}>Your Route</h4>
                <button
                  className="ico-btn"
                  onClick={() => {
                    clearRoute();
                    toast("Route cleared");
                  }}
                >
                  Clear
                </button>
              </div>
              <p className="muted" style={{ fontSize: ".8rem" }}>
                Click pins on the map to add numbered stops.
              </p>
              <div>
                {!route.length ? (
                  <div
                    className="empty"
                    style={{ padding: "1.2rem", fontSize: ".84rem" }}
                  >
                    No stops yet.
                  </div>
                ) : (
                  route.map((id, i) => {
                    const h = home(id);
                    if (!h) return null;
                    return (
                      <div key={id} className="route-stop">
                        <span className="route-num">{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <b style={{ fontSize: ".85rem" }}>{h.name}</b>
                          <div className="muted" style={{ fontSize: ".76rem" }}>
                            {nbhd(h.nb)?.name} · {money(h.price)}
                          </div>
                        </div>
                        <button
                          className="ico-btn danger"
                          onClick={() => removeRouteStop(id)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <div className="map-canvas" onClick={() => setPopupId(null)}>
          <svg className="roads" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,40 Q30,38 50,52 T100,46"
              stroke="#fff"
              strokeWidth="2.2"
              fill="none"
            />
            <path
              d="M20,0 Q26,40 40,70 T55,100"
              stroke="#fff"
              strokeWidth="1.6"
              fill="none"
            />
            <path d="M70,0 L72,100" stroke="#fff" strokeWidth="1.6" fill="none" />
            <path d="M0,75 L100,72" stroke="#fff" strokeWidth="1.4" fill="none" />
          </svg>
          {db.homes.map((h) => {
            const n = nbhd(h.nb);
            const idx = route.indexOf(h.id);
            const numbered = routeMode && idx >= 0;
            return (
              <div
                key={h.id}
                className="pin"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (routeMode) {
                    toggleRoute(h.id);
                  } else {
                    setPopupId((p) => (p === h.id ? null : h.id));
                  }
                }}
              >
                <div
                  className="dot"
                  style={{
                    background: n?.color,
                    outline: numbered ? "3px solid var(--gold)" : "none",
                  }}
                >
                  <span>{numbered ? idx + 1 : h.beds}</span>
                </div>
              </div>
            );
          })}
          {popupId &&
            (() => {
              const h = home(popupId);
              if (!h) return null;
              return (
                <div
                  className="map-pop"
                  style={{
                    left: `${Math.min(h.x, 72)}%`,
                    top: `${Math.max(h.y - 2, 2)}%`,
                    transform: "translate(-50%,-100%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={homePhoto(h)} alt="" />
                  <div style={{ padding: ".7rem .8rem" }}>
                    <b style={{ fontSize: ".9rem" }}>{h.name}</b>
                    <div className="muted" style={{ fontSize: ".76rem" }}>
                      {nbhd(h.nb)?.name} · {money(h.price)}
                    </div>
                    <div style={{ fontSize: ".76rem", margin: ".3rem 0" }}>
                      <span className="stars">{stars(h.rating)}</span> {h.rating}
                    </div>
                    <Link
                      href={`/home/${h.id}`}
                      className="btn btn-navy btn-sm btn-block"
                    >
                      View Home →
                    </Link>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
