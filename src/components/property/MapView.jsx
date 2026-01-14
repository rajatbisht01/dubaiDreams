"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Navigation } from "lucide-react";

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to update map view when properties change
const MapUpdater = ({ properties }) => {
  const map = useMap();
  
  useEffect(() => {
    if (properties.length > 0) {
      const validCoords = properties
        .filter(p => p.coordinates?.lat && p.coordinates?.lng)
        .map(p => [p.coordinates.lat, p.coordinates.lng]);
      
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 14 
        });
      }
    }
  }, [properties, map]);
  
  return null;
};

// Custom marker icon for properties
const createPropertyIcon = (isHovered = false) => {
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

// Custom marker icon for nearby points
const createNearbyIcon = (category) => {
  const colors = {
    school: '#10b981',
    hospital: '#ef4444',
    mall: '#8b5cf6',
    restaurant: '#f59e0b',
    transport: '#06b6d4',
    park: '#22c55e',
    gym: '#f97316',
    default: '#6b7280'
  };
  
  const color = colors[category?.toLowerCase()] || colors.default;
  
  return L.divIcon({
    className: "nearby-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const MapView = ({ properties = [] }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState([25.2048, 55.2708]);
  const [mapZoom, setMapZoom] = useState(11);
  const [showNearbyPoints, setShowNearbyPoints] = useState(true);
  console.log("MapView properties:", properties);
  // Extract coordinates from properties (using latitude/longitude fields)
  const propertiesWithCoords = properties
    .map((property, index) => {
      let coordinates = null;
      let coordSource = 'none';

      // Use latitude and longitude from property
      if (property.latitude && property.longitude) {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);
        
        // Validate coordinates
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
          coordSource = 'database';
        }
      }

      // Fallback: Demo coordinates with grid pattern
      if (!coordinates) {
        coordinates = {
          lat: 25.2048 + (Math.floor(index / 5) * 0.05) - 0.1,
          lng: 55.2708 + ((index % 5) * 0.05) - 0.1
        };
        coordSource = 'demo';
      }

      return {
        ...property,
        coordinates,
        coordSource
      };
    })
    .filter(p => p.coordinates?.lat && p.coordinates?.lng);

  // Extract all nearby points from properties
  const allNearbyPoints = propertiesWithCoords.flatMap(property => {
    if (!property.nearby_points || !showNearbyPoints) return [];
    
    return property.nearby_points
      .map((point, index) => {
        const lat = point.lat ? parseFloat(point.lat) : null;
        const lng = point.long ? parseFloat(point.long) : null; 
        
        // Validate coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          return null;
        }
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return null;
        }
        
        return {
          ...point,
          lat,
          lng,
          propertyId: property.id,
          propertyTitle: property.title,
          uniqueKey: `${property.id}-${index}`
        };
      })
      .filter(Boolean);
  });

  // Calculate map bounds when properties change
  useEffect(() => {
    if (propertiesWithCoords.length > 0) {
      const lats = propertiesWithCoords.map(p => p.coordinates.lat);
      const lngs = propertiesWithCoords.map(p => p.coordinates.lng);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      setMapCenter([centerLat, centerLng]);
      
      // Calculate appropriate zoom level
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const maxDiff = Math.max(latDiff, lngDiff);
      
      if (maxDiff > 1) setMapZoom(9);
      else if (maxDiff > 0.5) setMapZoom(10);
      else if (maxDiff > 0.2) setMapZoom(11);
      else if (maxDiff > 0.1) setMapZoom(12);
      else if (maxDiff > 0.05) setMapZoom(13);
      else setMapZoom(14);
    } else {
      setMapCenter([25.2048, 55.2708]);
      setMapZoom(11);
    }
  }, [propertiesWithCoords.length, properties.length]);

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

  const formatDistance = (distance) => {
    if (!distance) return '';
    const dist = parseFloat(distance);
    if (dist >= 1) {
      return `${dist.toFixed(1)} km`;
    }
    return `${(dist * 1000).toFixed(0)} m`;
  };

  // Get unique categories from nearby points
  const uniqueCategories = [...new Set(allNearbyPoints.map(p => p.category).filter(Boolean))];

  return (
    <div className="relative h-150 rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
        key={`map-${properties.length}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Auto-update map bounds when properties change */}
        <MapUpdater properties={propertiesWithCoords} />

        {/* Property Markers */}
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.coordinates.lat, property.coordinates.lng]}
            icon={createPropertyIcon(selectedProperty?.id === property.id)}
            eventHandlers={{
              click: () => setSelectedProperty(property),
              mouseover: () => setSelectedProperty(property),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <Link 
                  href={`/properties/${property.id}`}
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
                    {property.coordSource === 'demo' && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Demo Location
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

        {/* Nearby Points Markers */}
        {showNearbyPoints && allNearbyPoints.map((point) => (
          <Marker
            key={point.uniqueKey}
            position={[point.lat, point.lng]}
            icon={createNearbyIcon(point.category)}
          >
            <Popup maxWidth={250}>
              <div className="p-2">
                <h4 className="font-semibold text-sm mb-1">{point.name}</h4>
                {point.category && (
                  <p className="text-xs text-muted-foreground mb-1 capitalize">
                    📍 {point.category}
                  </p>
                )}
                {point.distance && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Navigation className="h-3 w-3" />
                    <span>{formatDistance(point.distance)} from {point.propertyTitle}</span>
                  </div>
                )}
                {point.description && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {point.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-50 space-y-2">
        <p className="text-sm font-semibold">
          <span className="text-primary">{propertiesWithCoords.length}</span> properties
        </p>
        {allNearbyPoints.length > 0 && (
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showNearbyPoints}
              onChange={(e) => setShowNearbyPoints(e.target.checked)}
              className="rounded"
            />
            <span>Show nearby points ({allNearbyPoints.length})</span>
          </label>
        )}
      </div>

      {/* Legend */}
      {showNearbyPoints && uniqueCategories.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 z-50 text-xs max-w-37.5">
          <p className="font-semibold mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></div>
              <span>Properties</span>
            </div>
            {uniqueCategories.map(category => {
              const colors = {
                school: '#10b981',
                hospital: '#ef4444',
                mall: '#8b5cf6',
                restaurant: '#f59e0b',
                transport: '#06b6d4',
                park: '#22c55e',
                gym: '#f97316',
                default: '#6b7280'
              };
              return (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: colors[category?.toLowerCase()] || colors.default }}
                  ></div>
                  <span className="capitalize">{category}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 max-w-md">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
          <Link href={`/properties/${selectedProperty.id}`}>
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
                {selectedProperty.coordSource === 'demo' && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ No coordinates provided
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MapView;