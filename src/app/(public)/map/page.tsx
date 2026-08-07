"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";
import { money, stars, homePhoto, NO_IMAGE_FALLBACK } from "@/lib/format";
import type { Home } from "@/lib/types";
import {Info } from "lucide-react";

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
  } = useStore();
  const { toast } = useToast();
  const [routeMode, setRouteMode] = useState(false);
  const [popupId, setPopupId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

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

  // Neighborhood filter (legend toggles) — applies while browsing; Route Mode
  // always shows every pin so any home can be added.
  const [hiddenNbs, setHiddenNbs] = useState<Set<string>>(new Set());
  const toggleNb = (id: string) =>
    setHiddenNbs((prev) => {
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

  // Map panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [startClient, setStartClient] = useState({ x: 0, y: 0 });
  const [draggedDistance, setDraggedDistance] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only drag with left click
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setStartClient({ x: e.clientX, y: e.clientY });
    setDraggedDistance(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dist = Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y);
    setDraggedDistance(dist);

    // Only drag / pan the map if mouse has moved more than 5 pixels (drag threshold)
    if (dist > 5) {
      if (e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      const newX = e.clientX - startPan.x;
      const newY = e.clientY - startPan.y;
      setPan({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setIsPanning(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

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

  // In Route Mode the preview follows the hovered pin; otherwise it's click-driven.
  const shownPopupId = routeMode ? hoverId : popupId;

  // Hover-intent: a small delay before hiding lets the pointer travel from the
  // pin into the popup to click "Add to Route".
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const showPreview = (id: string) => {
    cancelHide();
    setHoverId(id);
  };
  const hidePreviewSoon = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => setHoverId(null), 160);
  };

  // The model's street address (stored as a "Model location: …" feature),
  // falling back to the neighborhood for homes without one.
  const homeAddress = (h: Home) => {
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

  const openDirections = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

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
      .map(
        (h, i) =>
          `<li><b>${i + 1}. ${h.name}</b><br/>${nbhd(h.nb)?.name ?? ""} · ${homeAddress(h)}</li>`,
      )
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
            Click a pin to preview a home, or build a numbered route.
          </p>
        </div>
        <button
          className={"btn btn-sm " + (routeMode ? "btn-navy" : "btn-gold")}
          onClick={() => {
            setRouteMode((m) => !m);
            setPopupId(null);
            setHoverId(null);
          }}
        >
          {routeMode ? "✓ Route Mode On" : "Plan My Route"}
        </button>
      </div>
       
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
        <span>You must be registered and logged in to plan your route.</span>
      </div>
      <div className="map-layout">
        <div className="map-side">
          {!routeMode ? (
            <div>
              <h4 style={{ fontSize: ".95rem", marginBottom: ".2rem" }}>Neighborhoods</h4>
              <p className="muted" style={{ fontSize: ".76rem", margin: "0 0 .5rem" }}>
                Tap to show or hide on the map.
              </p>
              {db.neighborhoods.map((n) => {
                const hidden = hiddenNbs.has(n.id);
                const count = db.homes.filter((h) => h.nb === n.id).length;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleNb(n.id)}
                    aria-pressed={!hidden}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: ".3rem 0",
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
                        background: hidden ? "transparent" : n.color,
                        border: `2px solid ${n.color}`,
                        flexShrink: 0,
                      }}
                    ></span>
                    <span style={{ flex: 1, textDecoration: hidden ? "line-through" : "none" }}>
                      {n.name}
                    </span>
                    <span className="muted" style={{ fontSize: ".74rem" }}>{count}</span>
                  </button>
                );
              })}
              {hiddenNbs.size > 0 && (
                <button
                  type="button"
                  onClick={() => setHiddenNbs(new Set())}
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
                Click pins on the map to add numbered stops. Drag stops to
                reorder your route.
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
                          <b style={{ fontSize: ".85rem" }}>{h.name}</b>
                          <div className="muted" style={{ fontSize: ".76rem" }}>
                            {nbhd(h.nb)?.name} · {money(h.price)}
                          </div>
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
        <div
          className="map-canvas"
          onClick={() => {
            if (draggedDistance > 5) return;
            setPopupId(null);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            cursor: isPanning ? "grabbing" : "grab",
            touchAction: "none",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {routeMode && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 6,
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
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
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
              const isCurrent = tripActive && idx === tripIndex;
              // #4: hide filtered neighborhoods while browsing (all show in Route Mode).
              if (!routeMode && hiddenNbs.has(h.nb)) return null;
              return (
                <div
                  key={h.id}
                  className="pin"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  title={`${h.name} — ${n?.name ?? ""}`}
                  onMouseEnter={() => {
                    if (routeMode) showPreview(h.id);
                  }}
                  onMouseLeave={() => {
                    if (routeMode) hidePreviewSoon();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (draggedDistance > 5) return;
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
                      outline: numbered
                        ? isCurrent
                          ? "4px solid var(--gold)"
                          : "3px solid var(--gold-light)"
                        : "none",
                    }}
                  >
                    {numbered ? (
                      <span>{idx + 1}</span>
                    ) : (
                      <span
                        style={{
                          display: "block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,.9)",
                        }}
                      />
                    )}
                  </div>
                  <span className="pin-tip">{h.name}</span>
                </div>
              );
            })}
            {shownPopupId &&
              (() => {
                const h = home(shownPopupId);
                if (!h) return null;
                return (
                  <div
                    className="map-pop"
                    style={{
                      left: `${Math.min(Math.max(h.x, 15), 85)}%`,
                      top: h.y < 30 ? `${h.y}%` : `${Math.max(h.y - 2, 2)}%`,
                      transform: h.y < 30 ? "translate(-50%, 15px)" : "translate(-50%,-100%)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => {
                      if (routeMode) cancelHide();
                    }}
                    onMouseLeave={() => {
                      if (routeMode) hidePreviewSoon();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={homePhoto(h)}
                      alt={h.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = NO_IMAGE_FALLBACK;
                      }}
                    />
                    <div style={{ padding: ".7rem .8rem" }}>
                      <b style={{ fontSize: ".9rem" }}>{h.name}</b>
                      <div className="muted" style={{ fontSize: ".76rem" }}>
                        {nbhd(h.nb)?.name} · {money(h.price)}
                      </div>
                      {h.ratings > 0 && (
                        <div style={{ fontSize: ".76rem", margin: ".3rem 0" }}>
                          <span className="stars">{stars(h.rating)}</span> {h.rating}
                        </div>
                      )}
                      {(() => {
                        const inRoute = route.includes(h.id);
                        return (
                          <button
                            className={
                              "btn btn-sm btn-block " +
                              (inRoute ? "btn-outline" : "btn-navy")
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRoute(h.id);
                              toast(
                                inRoute
                                  ? "Removed from route"
                                  : "Added to your route"
                              );
                            }}
                          >
                            {inRoute ? "✓ In Route" : "Add to Route"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
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
            <b>{currentStop.name}</b>
            <span className="muted" style={{ fontSize: ".76rem" }}>
              {nbhd(currentStop.nb)?.name}
            </span>
          </div>
          <div className="trip-bar-actions">
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
                className="btn btn-gold btn-sm"
                onClick={() => {
                  setTripIndex(tripIndex + 1);
                  toast("➡ Next stop");
                }}
              >
                Next Stop →
              </button>
            ) : (
              <button
                className="btn btn-navy btn-sm"
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
