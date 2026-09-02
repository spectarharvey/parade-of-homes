"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import { money } from "@/lib/format";
import { homeLatLng, tourNumber } from "@/lib/homeGeo";
import type { Home } from "@/lib/types";
import { isPremierHome } from "@/lib/builderTier";
import QRScanner from "@/components/QRScanner";
import {Info } from "lucide-react";
import { useCms } from "@/lib/cms/context";

// The map is client-only (Leaflet needs `window`), so load it without SSR.
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      className="leaflet-map"
      style={{ display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".85rem" }}
    >
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  const {
    db,
    home,
    nbhd,
    route,
    toggleRoute,
    removeRouteStop,
    clearRoute,
    reorderRoute,
    tripActive,
    tripIndex,
    setTripActive,
    setTripIndex,
    visited,
    checkIn,
    ready,
    guestUser,
  } = useStore();
  const { toast } = useToast();
  const cms = useCms("map");
  const [routeMode, setRouteMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  // Record a visit from a scanned check-in QR (…/home/<id>?checkin=1) without
  // leaving the route — mirrors the scanner on the home detail page.
  const handleScan = (text: string) => {
    setScanning(false);
    const match = text.match(/\/home\/([^/?#\s]+)/);
    const scannedId = match ? decodeURIComponent(match[1]) : null;
    const target = scannedId && home(scannedId) ? scannedId : null;
    if (!target) {
      toast("That doesn't look like a Parade check-in code.");
      return;
    }
    if (visited.includes(target)) {
      toast("You're already checked in here.");
      return;
    }
    checkIn(target);
    toast("✓ Checked in at " + (home(target)?.name ?? "this home") + "!");
  };

  // Drop the dragged stop at position `target` and persist the new order.
  const moveStop = (target: number) => {
    const from = dragIdx;
    setDragIdx(null);
    setOverIdx(null);
    if (from === null || from === target) return;
    const next = [...route];
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    reorderRoute(next);
  };

  // Home filter (legend toggles) — applies while browsing; Route Mode always
  // shows every pin so any home can be added.
  const [hiddenHomes, setHiddenHomes] = useState<Set<string>>(new Set());
  const toggleHome = (id: string) =>
    setHiddenHomes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // A persisted, in-progress trip implies Route Mode — restore it when the page
  // remounts after navigating away.
  useEffect(() => {
    if (tripActive) setRouteMode(true);
  }, [tripActive]);

  const startTrip = () => {
    if (!route.length) {
      toast("Add at least one stop to your route first");
      return;
    }
    setRouteMode(true);
    setTripIndex(0);
    setTripActive(true);
    toast("🧭 Trip started — follow your stops!");
  };

  const currentStop = tripActive ? home(route[tripIndex]) : null;

  // The model's street address (its own column since the address migration;
  // older listings kept it as a "Model location: …" feature), falling back to
  // the neighborhood for homes without one.
  const homeAddress = (h: Home) => {
    if (h.address?.trim()) return h.address.trim();
    const loc = h.features?.find((f) => /^model location:/i.test(f));
    if (loc) return loc.replace(/^model location:\s*/i, "").trim();
    const n = nbhd(h.nb);
    return n ? `${n.name}, ${n.city}, FL` : h.name;
  };

  // Google Maps directions deep link (no API key required). Omitting the origin
  // lets Google Maps use the visitor's current location.
  const directionsUrl = (destination: string, waypoints: string[] = []) => {
    const params = new URLSearchParams({
      api: "1",
      destination,
      travelmode: "driving",
    });
    if (waypoints.length) params.set("waypoints", waypoints.join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const openDirections = (url: string) => {
    // On iOS Safari, window.open(_blank) to a Google Maps universal link hands
    // off to the Maps app but strands an about:blank tab — that stray blank tab
    // is the "white screen" users land on when they return, and a fresh one piles
    // up on every tap. Navigating the current tab hands off cleanly with no stray
    // tab (and opens an in-app browser in an installed PWA). Desktop keeps the
    // new-tab behavior so the app stays put.
    const isTouch =
      /iphone|ipad|ipod|android/i.test(navigator.userAgent) ||
      window.matchMedia?.("(pointer: coarse)").matches;
    if (isTouch) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Full route: current location → each stop in order.
  const openRouteDirections = () => {
    const addrs = route
      .map((id) => home(id))
      .filter((h): h is Home => Boolean(h))
      .map((h) => homeAddress(h));
    if (!addrs.length) return;
    openDirections(directionsUrl(addrs[addrs.length - 1], addrs.slice(0, -1)));
  };

  // Print a clean, standalone list of the route (own window — no page styles).
  const printRoute = () => {
    const rows = route
      .map((id) => home(id))
      .filter((h): h is Home => Boolean(h))
      .map((h, i) => {
        const b = db.builders.find((x) => x.id === h.builder)?.name;
        return `<li>${i + 1}. <b>${h.name}</b>${b ? ` by ${b}` : ""}<br/>${homeAddress(h)}</li>`;
      })
      .join("");
    if (!rows) return;
    const w = window.open("", "_blank", "width=560,height=720");
    if (!w) return;
    w.document.write(
      "<!doctype html><html><head><title>My 2026 Parade Route</title><style>" +
        "body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#12263a}" +
        "h1{color:#033256;font-size:20px;margin:0 0 4px}ol{line-height:1.7;font-size:14px;padding-left:20px}" +
        "li{margin-bottom:10px}p{color:#555;font-size:13px}" +
        "</style></head><body><h1>My 2026 Parade of Homes Route</h1>" +
        `<ol>${rows}</ol>` +
        "<p>Open house hours: Fri &amp; Sat 11 AM – 5 PM · Sun 12 PM – 5 PM</p></body></html>",
    );
    w.document.close();
    w.focus();
    w.print();
  };

  // Printable handout: a static map of every home + a numbered tour list.
  // Numbers match the tour numbers on the on-screen map pins. The static map
  // image is best-effort (external service); the legend always renders.
  const printTourMap = () => {
    const homes = [...db.homes];
    if (!homes.length) return;
    const nums = tourNumber(homes);
    const ordered = homes.sort((a, b) => nums[a.id] - nums[b.id]);
    const pins = ordered
      .map((h) => {
        const [la, ln] = homeLatLng(h);
        return `${la.toFixed(5)},${ln.toFixed(5)},ol-marker-blue`;
      })
      .join("|");
    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?size=680x460&maptype=mapnik&markers=${pins}`;
    const rows = ordered
      .map((h) => {
        const b = db.builders.find((x) => x.id === h.builder)?.name;
        return `<li><b>${h.name}</b>${b ? ` by ${b}` : ""}<br/><span class="addr">${homeAddress(h)}</span></li>`;
      })
      .join("");
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) return;
    w.document.write(
      "<!doctype html><html><head><title>2026 Parade of Homes — Tour Map</title><style>" +
        "body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#12263a}" +
        "h1{color:#033256;font-size:22px;margin:0 0 2px}.sub{color:#555;font-size:13px;margin:0 0 14px}" +
        "img{width:100%;max-width:680px;border:1px solid #d8dee5;border-radius:8px;display:block;margin:0 0 16px}" +
        "ol{line-height:1.45;font-size:13px;padding-left:22px;columns:2;column-gap:28px}" +
        "li{margin-bottom:9px;break-inside:avoid}.addr{color:#666;font-size:12px}" +
        "p.hours{color:#555;font-size:12px;margin-top:14px}" +
        "</style></head><body>" +
        "<h1>2026 MCBIA Parade of Homes — Tour Map</h1>" +
        `<p class="sub">${ordered.length} model homes · numbered tour order</p>` +
        `<img src="${mapUrl}" alt="Parade of Homes map" onerror="this.style.display='none'"/>` +
        `<ol>${rows}</ol>` +
        '<p class="hours">Open house hours: Fri &amp; Sat 11 AM – 5 PM · Sun 12 PM – 5 PM</p>' +
        "</body></html>",
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="wrap">
      {scanning && (
        <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
      )}
      <div className="crumb">
        <Link href="/">{cms.t("global.crumb.home")}</Link> / {cms.t("crumb")}
      </div>
      <div className="row-head">
        <div>
          <span className="eyebrow">{cms.t("head.eyebrow")}</span>
          <h2>{cms.t("head.title")}</h2>
          <p className="muted">{cms.t("head.blurb")}</p>
        </div>
        <button
          className={"btn btn-sm " + (routeMode ? "btn-navy" : "btn-gold")}
          onClick={() => setRouteMode((m) => !m)}
        >
          {routeMode ? "✓ Route Mode On" : "Plan My Route"}
        </button>
      </div>
       
      {/* Sign-in prompt — only for logged-out visitors, and only once the store
          has resolved the session so it never flashes at a logged-in guest. */}
      {ready && !guestUser && (
        <div
          style={{
            background: "rgba(17, 103, 153, 0.08)",
            border: "1px solid rgba(17, 103, 153, 0.25)",
            borderRadius: "var(--radius)",
            padding: "0.85rem 1.2rem",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--navy)",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          <Info size={20} style={{ color: "var(--navy)", flexShrink: 0 }} />
          <span>
            {cms.t("signin.text")}{" "}
            <Link href="/register?tab=login" style={{ color: "var(--navy)", textDecoration: "underline" }}>
              {cms.t("signin.loginLabel")}
            </Link>{" "}
            or{" "}
            <Link href="/register" style={{ color: "var(--navy)", textDecoration: "underline" }}>
              {cms.t("signin.registerLabel")}
            </Link>
            .
          </span>
        </div>
      )}
      <div className="map-layout">
        <div className="map-side">
          {!routeMode ? (
            <div>
              <h4 style={{ fontSize: ".95rem", marginBottom: ".2rem" }}>{cms.t("side.homesTitle")}</h4>
              <p className="muted" style={{ fontSize: ".76rem", margin: "0 0 .5rem" }}>
                {cms.t("side.homesHint")}
              </p>
              {db.homes.length > 0 && (
                <button
                  className="btn btn-outline btn-sm btn-block"
                  style={{ marginBottom: ".7rem" }}
                  onClick={printTourMap}
                >
                  {cms.t("side.printLabel")}
                </button>
              )}
              {db.homes.map((h) => {
                const hidden = hiddenHomes.has(h.id);
                const addr = homeAddress(h);
                const b = db.builders.find((x) => x.id === h.builder);
                const isPremier = isPremierHome(h, b);
                const displayName = b?.name ? `${h.name} by ${b.name}` : h.name;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHome(h.id)}
                    aria-pressed={!hidden}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: ".35rem 0",
                      cursor: "pointer",
                      fontSize: ".84rem",
                      textAlign: "left",
                      color: "inherit",
                      opacity: hidden ? 0.45 : 1,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: hidden ? "transparent" : h.color,
                        border: `2px solid ${h.color}`,
                        flexShrink: 0,
                      }}
                    ></span>
                    <span style={{ flex: 1, textDecoration: hidden ? "line-through" : "none" }}>
                      <b style={{ fontWeight: 700 }}>{h.name}</b>
                      {b?.name ? <span style={{ fontWeight: 400 }}> by {b.name}</span> : null}{" "}
                      {isPremier && <span style={{ color: "var(--gold)", marginLeft: ".25rem", fontWeight: "bold" }}>★</span>}
                      {addr ? (
                        <span className="muted" style={{ display: "block", fontSize: ".72rem", textDecoration: "none", fontWeight: 400, marginTop:"5px" }}>
                          {addr}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
              {hiddenHomes.size > 0 && (
                <button
                  type="button"
                  onClick={() => setHiddenHomes(new Set())}
                  style={{ background: "none", border: "none", color: "var(--navy)", fontWeight: 600, fontSize: ".78rem", cursor: "pointer", padding: ".3rem 0 0" }}
                >
                  Show all
                </button>
              )}

              {route.length > 0 && (
                <>
                  <hr className="soft" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem" }}>
                    <b style={{ fontSize: ".85rem" }}>
                      🧭 My Route · {route.length} stop{route.length > 1 ? "s" : ""}
                    </b>
                    <button className="ico-btn" onClick={() => setRouteMode(true)}>Open</button>
                  </div>
                </>
              )}

              <hr className="soft" />
              <p className="muted" style={{ fontSize: ".82rem" }}>
                <b>Tip:</b> turn on <b>Plan My Route</b>, then click pins in the order
                you want to visit. We&apos;ll number your stops.
              </p>
              <div className="muted" style={{ fontSize: ".8rem", marginTop: ".6rem", lineHeight: 1.5 }}>
                <b>Open house hours</b>
                <br />
                Fri &amp; Sat 11 AM – 5 PM
                <br />
                Sun 12 PM – 5 PM
              </div>
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
                <div style={{ display: "flex", gap: ".4rem" }}>
                  {route.length > 0 && (
                    <button className="ico-btn" onClick={printRoute}>
                      🖨 Print
                    </button>
                  )}
                  <button
                    className="ico-btn"
                    onClick={() => {
                      clearRoute();
                      setTripActive(false);
                      toast("Route cleared");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <p className="muted" style={{ fontSize: ".8rem" }}>
                {cms.t("side.routeHint")}
              </p>
              <div>
                {!route.length ? (
                  <div
                    className="empty"
                    style={{ padding: "1.2rem", fontSize: ".84rem" }}
                  >
                    {cms.t("side.emptyRoute")}
                  </div>
                ) : (
                  route.map((id, i) => {
                    const h = home(id);
                    if (!h) return null;
                    const active = tripActive && i === tripIndex;
                    const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;
                    const stopStyle: React.CSSProperties = { cursor: "grab" };
                    if (dragIdx === i) stopStyle.opacity = 0.4;
                    if (isOver) stopStyle.background = "rgba(201,162,75,.18)";
                    if (active) {
                      stopStyle.borderColor = "var(--gold)";
                      stopStyle.background = "rgba(116,167,202,.12)";
                      stopStyle.boxShadow = "0 0 0 2px var(--gold)";
                    }
                    return (
                      <div
                        key={id}
                        className="route-stop"
                        draggable
                        onDragStart={(e) => {
                          setDragIdx(i);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (overIdx !== i) setOverIdx(i);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          moveStop(i);
                        }}
                        onDragEnd={() => {
                          setDragIdx(null);
                          setOverIdx(null);
                        }}
                        style={stopStyle}
                      >
                        <span
                          aria-hidden="true"
                          title="Drag to reorder"
                          style={{ color: "var(--muted)", cursor: "grab", fontSize: ".95rem", lineHeight: 1, userSelect: "none" }}
                        >
                          ⠿
                        </span>
                        <span className="route-num">{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          {(() => {
                            const b = db.builders.find((x) => x.id === h.builder);
                            const addr = homeAddress(h);
                            return (
                              <>
                                <div>
                                  <b style={{ fontSize: ".85rem", fontWeight: 700 }}>{h.name}</b>
                                  {b?.name ? <span style={{ fontSize: ".82rem", fontWeight: 400 }}> by {b.name}</span> : null}
                                </div>
                                <div className="muted" style={{ fontSize: ".76rem" }}>
                                  {addr} · {money(h.price)}
                                </div>
                              </>
                            );
                          })()}
                          <button
                            type="button"
                            draggable={false}
                            onClick={() => openDirections(directionsUrl(homeAddress(h)))}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              marginTop: ".3rem",
                              color: "var(--navy)",
                              fontWeight: 600,
                              fontSize: ".76rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: ".25rem",
                            }}
                          >
                            🧭 Get Directions
                          </button>
                        </div>
                        <button
                          className="ico-btn danger"
                          onClick={() => {
                            removeRouteStop(id);
                            if (tripIndex >= route.length - 1)
                              setTripIndex(Math.max(0, tripIndex - 1));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {!!route.length && !tripActive && (
                <button
                  className="btn btn-gold btn-block"
                  style={{ marginTop: ".8rem" }}
                  onClick={startTrip}
                >
                  ▶ Start Trip ({route.length} stop{route.length > 1 ? "s" : ""})
                </button>
              )}
              {!!route.length && tripActive && (
                <>
                  <button
                    className="btn btn-navy btn-block"
                    style={{ marginTop: ".8rem" }}
                    onClick={openRouteDirections}
                  >
                    🧭 Get Directions (Google Maps)
                  </button>
                  <button
                    className="btn btn-outline btn-sm btn-block"
                    style={{ marginTop: ".6rem" }}
                    onClick={() => {
                      setTripActive(false);
                      toast("Trip ended");
                    }}
                  >
                    ■ End Trip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="map-canvas" style={{ position: "relative", overflow: "hidden" }}>
          {routeMode && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: "rgba(3,50,86,.94)",
                color: "#fff",
                padding: ".55rem 1rem",
                fontSize: ".85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  boxShadow: "0 0 0 3px rgba(201,162,75,.4)",
                  flexShrink: 0,
                }}
              />
              Planning your route — tap pins in the order you want to visit.
            </div>
          )}
          <LeafletMap routeMode={routeMode} hiddenHomes={hiddenHomes} />

          {/* Floating Map Legend Card — bottom right corner */}
          <div className="map-legend-card">
            <div className="map-legend-item">
              <span className="legend-icon featured-builder" />
              <span className="legend-label">FEATURED BUILDER</span>
            </div>
            <div className="map-legend-item">
              <span className="legend-icon premier-builder" />
              <span className="legend-label">PREMIER BUILDER</span>
            </div>
            <div className="map-legend-item">
              <span className="legend-icon standard-builder" />
              <span className="legend-label">STANDARD BUILDER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky trip bar — prominent on mobile */}
      {tripActive && currentStop && (
        <div className="trip-bar">
          <div className="trip-bar-info">
            <span className="trip-bar-step">
              Stop {tripIndex + 1} of {route.length}
            </span>
            {(() => {
              const currentBuilder = db.builders.find((x) => x.id === currentStop.builder);
              const currentAddr = homeAddress(currentStop);
              return (
                <>
                  <div>
                    <b style={{ fontWeight: 700 }}>{currentStop.name}</b>
                    {currentBuilder?.name ? <span style={{ fontWeight: 400 }}> by {currentBuilder.name}</span> : null}
                  </div>
                  <span className="muted" style={{ fontSize: ".76rem" }}>
                    {currentAddr}
                  </span>
                </>
              );
            })()}
          </div>
          <div className="trip-bar-actions">
            {visited.includes(currentStop.id) ? (
              <button className="btn btn-outline btn-sm" disabled>
                ✓ Checked In
              </button>
            ) : (
              <button
                className="btn btn-gold btn-sm"
                onClick={() => setScanning(true)}
              >
                📷 Check In
              </button>
            )}
            <Link href={`/home/${currentStop.id}`} className="btn btn-outline btn-sm">
              Details
            </Link>
            <button
              className="btn btn-navy btn-sm"
              onClick={() => openDirections(directionsUrl(homeAddress(currentStop)))}
            >
              🧭 Directions
            </button>
            {tripIndex < route.length - 1 ? (
              <button
                className={
                  "btn btn-sm " +
                  (visited.includes(currentStop.id) ? "btn-gold" : "btn-navy")
                }
                onClick={() => {
                  setTripIndex(tripIndex + 1);
                  toast("➡ Next stop");
                }}
              >
                Next Stop →
              </button>
            ) : (
              <button
                className={
                  "btn btn-sm " +
                  (visited.includes(currentStop.id) ? "btn-gold" : "btn-navy")
                }
                onClick={() => {
                  setTripActive(false);
                  toast("🏁 You finished your parade route!");
                }}
              >
                Finish ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
