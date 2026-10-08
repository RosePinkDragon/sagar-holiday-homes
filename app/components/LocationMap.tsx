"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  label: string;
  lat: number;
  lng: number;
  /** The villa's own pin: larger and always labelled. */
  primary?: boolean;
};

/** Opens the spot in Google Maps (the app on Android), where guests can explore it. */
const googleMapsHref = ({ lat, lng }: MapPin) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/**
 * Leaflet + OpenStreetMap tiles. Leaflet is only fetched once the map nears
 * the viewport, so the page itself stays light on mid-range phones. Every
 * pin opens Google Maps in a new tab.
 */
export default function LocationMap({
  pins,
  title,
}: {
  pins: readonly MapPin[];
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || pins.length === 0) return;

    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    const init = async () => {
      const L = await import("leaflet");
      if (cancelled) return;

      map = L.map(el, {
        scrollWheelZoom: false,
        // One-finger drag would trap page scrolling on phones; pinch still zooms.
        dragging: !L.Browser.mobile,
        attributionControl: true,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      for (const pin of pins) {
        const size = pin.primary ? 22 : 16;
        const marker = L.marker([pin.lat, pin.lng], {
          title: `${pin.label} — open in Google Maps`,
          alt: pin.label,
          keyboard: true,
          icon: L.divIcon({
            className: "",
            html: `<span class="map-pin${pin.primary ? " map-pin-primary" : ""}"></span>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
        }).addTo(map);
        marker.bindTooltip(pin.label, {
          direction: "top",
          offset: [0, -size / 2],
          permanent: pin.primary,
        });
        marker.on("click", () => {
          window.open(googleMapsHref(pin), "_blank", "noopener,noreferrer");
        });
      }

      if (pins.length === 1) {
        map.setView([pins[0].lat, pins[0].lng], 14);
      } else {
        map.fitBounds(
          L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])),
          { padding: [32, 32] }
        );
      }
      setReady(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void init();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [pins]);

  return (
    <div
      className="hairline overflow-hidden relative"
      style={{ aspectRatio: "4 / 3" }}
    >
      <div
        ref={containerRef}
        role="region"
        aria-label={title}
        style={{ position: "absolute", inset: 0 }}
      />
      {!ready ? (
        <div
          className="photo-placeholder"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden="true"
        >
          <p className="muted text-fine">Loading map…</p>
        </div>
      ) : null}
    </div>
  );
}
