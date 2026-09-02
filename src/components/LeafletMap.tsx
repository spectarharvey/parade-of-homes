"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMapInstance, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useStore, useToast } from "@/lib/store";
import { money, homePhoto, stars } from "@/lib/format";
import { homeLatLng, MAP_FALLBACK_CENTER, tourNumber, homeAddress } from "@/lib/homeGeo";
import type { Home } from "@/lib/types";
import { isPremierHome } from "@/lib/builderTier";

type Props = {
  routeMode: boolean;
  hiddenHomes: Set<string>;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/**
 * Real street map (OpenStreetMap tiles via Leaflet) that plots every Parade
 * home, auto-zooms to fit them all, and mirrors the route-planning behavior of
 * the sidebar: browse mode opens a detail popup with "Add to Route"; route mode
 * toggles the home in/out of the route and numbers the pins in visit order.
 */
export default function LeafletMap({ routeMode, hiddenHomes }: Props) {
  const { db, nbhd, route, toggleRoute, tripActive, tripIndex } = useStore();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const fittedRef = useRef(false);

  // Create the map once, on mount (client only — Leaflet needs `window`).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: MAP_FALLBACK_CENTER,
        zoom: 11,
        scrollWheelZoom: true,
      });
      // Muted CARTO Positron basemap so the branded pins stand out (no API key).
      // Falls back to OSM raster if CARTO tiles fail.
      const carto = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      );
      let swappedToOsm = false;
      carto.on("tileerror", () => {
        if (swappedToOsm) return;
        swappedToOsm = true;
        carto.remove();
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
      });
      carto.addTo(map);
      mapRef.current = map;
      // The grid cell may finish sizing after mount.
      setTimeout(() => map.invalidateSize(), 0);
      draw();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers whenever the data or interaction mode changes.
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.homes, route, routeMode, hiddenHomes, tripActive, tripIndex]);

  function popupHtml(h: Home) {
    const inRoute = route.includes(h.id);
    const b = db.builders.find((x) => x.id === h.builder);
    const isPremier = isPremierHome(h, b);
    const titleHtml = `<b>${isPremier ? `<span style="color:var(--gold); margin-right:0.25rem;">★</span>` : ""}${esc(h.name)}</b>${b?.name ? `<span style="font-weight:400; color:#555;"> by ${esc(b.name)}</span>` : ""}`;
    const addr = homeAddress(h, nbhd);
    const ratingRow =
      h.ratings > 0
        ? `<div class="pop-rating"><span class="stars">${stars(h.rating)}</span> ${h.rating}</div>`
        : "";
    return (
      `<div class="pop-card">` +
      `<img src="${esc(homePhoto(h, 400))}" alt="${esc(h.name)}" onerror="this.src='/placeholder-home.svg'"/>` +
      `<div class="pop-body">` +
      `${titleHtml}` +
      `<div class="pop-sub">${esc(addr)} · ${money(h.price)}</div>` +
      ratingRow +
      `<a class="pop-link" href="/home/${h.id}">View details →</a>` +
      `<button type="button" class="pop-add btn btn-sm btn-block ${inRoute ? "btn-outline" : "btn-navy"}">${inRoute ? "✓ In Route" : "Add to Route"}</button>` +
      `</div></div>`
    );
  }

  // Non-interactive hover preview for Route Mode — same card, minus the buttons,
  // plus a line telling you what clicking the pin will do.
  function previewHtml(h: Home) {
    const idx = route.indexOf(h.id);
    const inRoute = idx >= 0;
    const b = db.builders.find((x) => x.id === h.builder);
    const isPremier = isPremierHome(h, b);
    const titleHtml = `<b>${isPremier ? `<span style="color:var(--gold); margin-right:0.25rem;">★</span>` : ""}${esc(h.name)}</b>${b?.name ? `<span style="font-weight:400; color:#555;"> by ${esc(b.name)}</span>` : ""}`;
    const addr = homeAddress(h, nbhd);
    const ratingRow =
      h.ratings > 0
        ? `<div class="pop-rating"><span class="stars">${stars(h.rating)}</span> ${h.rating}</div>`
        : "";
    const status = inRoute
      ? `<div class="pop-status in">✓ Stop ${idx + 1} in your route · click to remove</div>`
      : `<div class="pop-status">Click pin to add to route</div>`;
    return (
      `<div class="pop-card">` +
      `<img src="${esc(homePhoto(h, 400))}" alt="${esc(h.name)}" onerror="this.src='/placeholder-home.svg'"/>` +
      `<div class="pop-body">` +
      `${titleHtml}` +
      `<div class="pop-sub">${esc(addr)} · ${money(h.price)}</div>` +
      ratingRow +
      status +
      `</div></div>`
    );
  }

  function draw() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Browse mode respects the legend filter; route mode shows every pin so any
    // home can be added.
    const visible = db.homes.filter((h) => routeMode || !hiddenHomes.has(h.id));
    const bounds: [number, number][] = [];
    // Stable tour numbers (grouped by community) for the pin labels.
    const nums = tourNumber(db.homes);

    visible.forEach((h) => {
      const ll = homeLatLng(h);
      bounds.push(ll);
      const idx = route.indexOf(h.id);
      const numbered = routeMode && idx >= 0;
      const isCurrent = tripActive && idx === tripIndex;
      const b = db.builders.find((x) => x.id === h.builder);
      const isPremier = isPremierHome(h, b);
      const isFeaturedBuilder = Boolean(b?.featured);
      const iconColorClass = isPremier ? "is-premier" : "is-normal";
      const featuredClass = isFeaturedBuilder ? "is-featured-builder" : "";
      // Route stops show their visit order; every other pin shows its tour number.
      const label = numbered ? idx + 1 : (nums[h.id] ?? "");
      const stateClass = isCurrent ? "is-current" : numbered ? "is-route" : "";
      const icon = L.divIcon({
        className: "home-marker",
        html: `<div class="home-pin-wrapper ${stateClass}">` +
          `<svg class="home-pin-svg ${iconColorClass} ${featuredClass}" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"${isFeaturedBuilder ? ' stroke="#e11d48" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"' : ''}/></svg>` +
          `<span class="home-pin-num-badge"><b>${label}</b></span>` +
          `</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 34],
        popupAnchor: [0, -32],
      });
      const marker = L.marker(ll, { icon, title: b?.name ? `${h.name} by ${b.name}` : h.name }).addTo(map);


      if (!routeMode) {
        marker.bindPopup(popupHtml(h), { minWidth: 220, maxWidth: 240 });
        marker.on("popupopen", (e) => {
          const el = (e.popup.getElement() as HTMLElement | null) ?? null;
          const btn = el?.querySelector<HTMLButtonElement>(".pop-add");
          if (btn)
            btn.onclick = () => {
              const inRoute = route.includes(h.id);
              toggleRoute(h.id);
              toast(inRoute ? "Removed from route" : "Added to your route");
              marker.closePopup();
            };
        });
      } else {
        // Route mode: hover shows a quick preview so you can see what a pin is
        // before adding it; clicking still toggles it in/out of the route.
        marker.bindTooltip(previewHtml(h), {
          direction: "top",
          offset: L.point(0, -14),
          opacity: 1,
          className: "home-tooltip",
        });
        marker.on("click", () => {
          const inRoute = route.includes(h.id);
          toggleRoute(h.id);
          toast(inRoute ? "Removed from route" : "Added to your route");
        });
      }

      markersRef.current.push(marker);
    });

    // Zoom out to fit every home the first time we have positions.
    if (!fittedRef.current && bounds.length) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
      fittedRef.current = true;
    }
  }

  return <div ref={containerRef} className="leaflet-map" />;
}
