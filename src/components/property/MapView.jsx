"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
// Dynamically import React Leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapView({ properties }) {
  const mapRef = useRef(null);
  const [L, setL] = useState(null);
  const router = useRouter();

  // ✅ Load Leaflet client-side
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  // ✅ Fit map to markers once both map + Leaflet are ready
  useEffect(() => {
    if (L && mapRef.current && properties?.length > 0) {
      const validProps = properties.filter(
        (p) => p.location_lat && p.location_lng
      );

      if (validProps.length > 0) {
        const bounds = L.latLngBounds(
          validProps.map((p) => [p.location_lat, p.location_lng])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [L, properties]);

  const defaultCenter = [25.276987, 55.296249];

  // ✅ Render placeholder until map + Leaflet are loaded
  if (!L) {
    return (
      <div className="text-center text-muted-foreground">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      scrollWheelZoom
      className="w-full h-[80vh] rounded-lg"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties
        .filter((p) => p.location_lat && p.location_lng)
        .map((property) => (
          <Marker
            key={property.id}
            position={[property.location_lat, property.location_lng]}
          >
            <Popup>
              <div className="text-sm">
                <strong>{property.title}</strong>
                <br />
                {property.community}, {property.emirate}
                <br />
                AED {property.price?.toLocaleString()}
              </div>
                <Button onClick={ ()=>router.push(`/properties/${property.id}`)}>View Details</Button>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
