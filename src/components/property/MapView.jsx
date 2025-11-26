"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapPin, Home, Bed, Bath, Maximize } from "lucide-react";

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon with primary color
const createCustomIcon = (isHovered = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${isHovered ? '#0ea5e9' : '#3b82f6'};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="white"
          style="transform: rotate(45deg);"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const MapView = ({ properties = [] }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState([25.2048, 55.2708]); // Dubai coordinates
  const [mapZoom, setMapZoom] = useState(11);

  // Extract coordinates from properties
  const propertiesWithCoords = properties
    .map(property => {
      // Try to extract coordinates from location_map_url or nearby points
      let lat = null;
      let lng = null;

      // Parse from location_map_url if it contains coordinates
      if (property.location_map_url) {
        const coordMatch = property.location_map_url.match(/[@=](-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      }

      // Use first nearby point if available
      if (!lat && property.property_nearby_points && property.property_nearby_points.length > 0) {
        const firstPoint = property.property_nearby_points[0];
        if (firstPoint.lat && firstPoint.lang) {
          lat = parseFloat(firstPoint.lat);
          lng = parseFloat(firstPoint.lang);
        }
      }

      // Default to Dubai coordinates with slight random offset for demo
      if (!lat || !lng) {
        lat = 25.2048 + (Math.random() - 0.5) * 0.2;
        lng = 55.2708 + (Math.random() - 0.5) * 0.2;
      }

      return {
        ...property,
        coordinates: { lat, lng }
      };
    })
    .filter(p => p.coordinates.lat && p.coordinates.lng);

  // Calculate map bounds to fit all properties
  useEffect(() => {
    if (propertiesWithCoords.length > 0) {
      const lats = propertiesWithCoords.map(p => p.coordinates.lat);
      const lngs = propertiesWithCoords.map(p => p.coordinates.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
    }
  }, [properties]);

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(2)}M`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  const getFeaturedImage = (property) => {
    if (property.property_images && property.property_images.length > 0) {
      const featured = property.property_images.find(img => img.is_featured);
      return featured ? featured.image_url : property.property_images[0].image_url;
    }
    return "/placeholder-property.jpg";
  };

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.coordinates.lat, property.coordinates.lng]}
            icon={createCustomIcon(selectedProperty?.id === property.id)}
            eventHandlers={{
              click: () => setSelectedProperty(property),
              mouseover: () => setSelectedProperty(property),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <Link 
                  href={`/properties/${property.slug}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="relative h-40 w-full mb-2 rounded-md overflow-hidden">
                    <img
                      src={getFeaturedImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    {property.isFeatured && (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base mb-1 line-clamp-2">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">
                      {property.communities?.name || "Dubai"}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-primary mb-2">
                    {formatPrice(property.starting_price)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.size_range && (
                      <div className="flex items-center gap-1">
                        <Maximize className="h-3 w-3" />
                        <span>{property.size_range}</span>
                      </div>
                    )}
                  </div>

                  {property.property_types?.name && (
                    <div className="mt-2">
                      <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                        {property.property_types.name}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Property count overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
        <p className="text-sm font-semibold">
          <span className="text-primary">{propertiesWithCoords.length}</span> properties on map
        </p>
      </div>

      {/* Selected property card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000] max-w-md">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
          <Link href={`/properties/${selectedProperty.slug}`}>
            <div className="flex gap-3">
              <img
                src={getFeaturedImage(selectedProperty)}
                alt={selectedProperty.title}
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                  {selectedProperty.title}
                </h4>
                <p className="text-primary font-bold text-base mb-1">
                  {formatPrice(selectedProperty.starting_price)}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {selectedProperty.bedrooms && <span>{selectedProperty.bedrooms} Beds</span>}
                  {selectedProperty.bathrooms && <span>• {selectedProperty.bathrooms} Baths</span>}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MapView;