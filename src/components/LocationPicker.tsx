"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMapInstance, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_FALLBACK_CENTER } from "@/lib/homeGeo";

type Props = {
  lat: number | null | undefined;
  lng: number | null | undefined;
  onChange: (lat: number, lng: number) => void;
};

/**
 * Admin pin-picker: a small real map with one draggable marker. Drag it or click
 * anywhere to set the home's exact coordinates. Reports [lat, lng] via onChange.
 * Client-only (Leaflet needs `window`) — load it with next/dynamic ssr:false.
 */
export default function LocationPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  // Keep the latest onChange without re-running the init effect.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const hasCoords = typeof lat === "number" && typeof lng === "number";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const start: [number, number] = hasCoords
        ? [lat as number, lng as number]
        : MAP_FALLBACK_CENTER;
      const map = L.map(containerRef.current, {
        center: start,
        zoom: hasCoords ? 15 : 11,
        scrollWheelZoom: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      const icon = L.divIcon({
        className: "home-marker",
        html: `<span class="pin-marker"></span>`,
        iconSize: [30, 40],
        iconAnchor: [15, 38],
      });
      const marker = L.marker(start, { icon, draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current(round(p.lat), round(p.lng));
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(round(e.latlng.lat), round(e.latlng.lng));
      });

      mapRef.current = map;
      markerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 0);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect coordinate changes coming from outside (e.g. loading a home to edit).
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !hasCoords) return;
    const ll: [number, number] = [lat as number, lng as number];
    markerRef.current.setLatLng(ll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setView(MAP_FALLBACK_CENTER, 11);
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: 260, borderRadius: 10, border: "1px solid var(--line)", overflow: "hidden" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: ".5rem",
          marginTop: ".4rem",
          fontSize: ".76rem",
          color: "var(--muted)",
        }}
      >
        <span>
          {hasCoords ? (
            <>
              📍 {(lat as number).toFixed(5)}, {(lng as number).toFixed(5)}
            </>
          ) : (
            "Drag the pin (or tap the map) to the model home's exact address."
          )}
        </span>
        <button
          type="button"
          onClick={recenter}
          style={{
            background: "none",
            border: "none",
            color: "var(--navy)",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            whiteSpace: "nowrap",
          }}
        >
          Center on Ocala
        </button>
      </div>
    </div>
  );
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;
