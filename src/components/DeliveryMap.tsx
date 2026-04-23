import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  deliveryPosition: { lat: number; lng: number };
  delivered: boolean;
  routeCoords: [number, number][];
}

const makeIcon = (emoji: string, bg: string) =>
  L.divIcon({
    html: `<div style="background:${bg};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2.5px solid white;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "",
  });

const originIcon  = makeIcon("🍔", "#E63946");
const destIcon    = makeIcon("🏠", "#2d6a4f");
const deliveryIcon = makeIcon("🛵", "#F4A261");

export default function DeliveryMap({ origin, destination, deliveryPosition, delivered, routeCoords }: DeliveryMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const dMarker     = useRef<L.Marker | null>(null);
  const routeLine   = useRef<L.Polyline | null>(null);
  const [ready, setReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Leaflet | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup("🍔 Burguer Dely — QNG 04");

    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup("🏠 Seu endereço");

    const marker = L.marker([origin.lat, origin.lng], { icon: deliveryIcon })
      .addTo(map)
      .bindPopup("🛵 Entregador a caminho");
    dMarker.current = marker;

    map.fitBounds(
      [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      { padding: [60, 60] }
    );

    mapInstance.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Draw route when coords arrive
  useEffect(() => {
    if (!ready || !mapInstance.current || routeCoords.length < 2) return;
    if (routeLine.current) routeLine.current.remove();
    routeLine.current = L.polyline(routeCoords, {
      color: "#E63946",
      weight: 4,
      opacity: 0.85,
    }).addTo(mapInstance.current);
  }, [ready, routeCoords]);

  // Move delivery marker
  useEffect(() => {
    if (dMarker.current) {
      dMarker.current.setLatLng([deliveryPosition.lat, deliveryPosition.lng]);
    }
  }, [deliveryPosition.lat, deliveryPosition.lng]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapRef} style={{ height: 360, width: "100%", borderRadius: 12 }} />
      {delivered && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          borderRadius: 12, gap: 8,
        }}>
          <span style={{ fontSize: 48 }}>✅</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Pedido entregue!</span>
        </div>
      )}
    </div>
  );
}
