"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, Navigation, X, ChevronRight, Building2, Clock, TrendingUp, Calendar, Home } from "lucide-react";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Premium property marker with price tag
const createPropertyMarker = (price, isHovered = false, isFeatured = false) => {
  const formattedPrice = price >= 1000000 
    ? `${(price / 1000000).toFixed(1)}M` 
    : price >= 1000 
      ? `${(price / 1000).toFixed(0)}K`
      : price;

  const bgColor = isFeatured ? '#d4af37' : isHovered ? '#0ea5e9' : '#3b82f6';
  const scale = isHovered ? 1.15 : 1;

  return L.divIcon({
    className: "property-marker",
    html: `
      <div style="
        position: relative;
        transform: scale(${scale});
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
      ">
        <div style="
          background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);
          padding: 8px 14px;
          border-radius: 24px;
          border: 3px solid white;
          white-space: nowrap;
          font-weight: 700;
          font-size: 12px;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
        ">
          <span style="font-size: 10px; opacity: 0.9;">AED</span>
          <span>${formattedPrice}</span>
          ${isFeatured ? '<span style="margin-left: 2px;">⭐</span>' : ''}
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
        "></div>
        <div style="
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${bgColor};
        "></div>
      </div>
    `,
    iconSize: [100, 50],
    iconAnchor: [50, 58],
    popupAnchor: [0, -58],
  });
};

// Premium nearby point markers with SVG icons
const createNearbyMarker = (category, isFiltered = false) => {
  const categoryConfig = {
    school: { 
      color: '#10b981', 
      icon: `<path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
<path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>` 
    },
    hospital: { 
      color: '#ef4444', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>` 
    },
    mall: { 
      color: '#8b5cf6', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/>` 
    },
    restaurant: { 
      color: '#f59e0b', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z"/>` 
    },
    transport: { 
      color: '#06b6d4', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>` 
    },
    park: { 
      color: '#22c55e', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>` 
    },
    gym: { 
      color: '#f97316', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 12h12M6 8h12M6 16h12"/>` 
    },
    mosque: { 
      color: '#7c3aed', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/>` 
    },
    beach: { 
      color: '#0ea5e9', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"/>` 
    },
    default: { 
      color: '#6b7280', 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>` 
    }
  };

  const config = categoryConfig[category?.toLowerCase()] || categoryConfig.default;
  const opacity = isFiltered ? 0.3 : 1;
  const scale = isFiltered ? 0.8 : 1;

  return L.divIcon({
    className: "nearby-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(${scale});
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: ${opacity};
      ">
        <div style="
          background: ${config.color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        " class="nearby-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${config.icon}
          </svg>
        </div>
        <div style="
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 2px solid ${config.color};
          border-radius: 50%;
          bottom: -4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

const MapView = ({ properties = [] }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [showNearbyPoints, setShowNearbyPoints] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const mapRef = useRef(null);

  const propertiesWithCoords = properties
    .map((property, index) => {
      let coordinates = null;
      let coordSource = 'none';

      if (property.latitude && property.longitude) {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
          coordSource = 'database';
        }
      }

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

  console.log(`Properties with coordinates: ${propertiesWithCoords.length}`, propertiesWithCoords);

  const allNearbyPoints = propertiesWithCoords.flatMap(property => {
    // Handle both property_nearby_points and nearby_points
    const nearbyPoints = property.property_nearby_points || property.nearby_points || [];
    
    console.log(`Property ${property.title} has ${nearbyPoints.length} nearby points`, nearbyPoints);
    
    if (!nearbyPoints || nearbyPoints.length === 0) return [];
    
    return nearbyPoints
      .map((point, index) => {
        // Handle different possible field names for coordinates
        const lat = point.lat || point.latitude ? parseFloat(point.lat || point.latitude) : null;
        const lng = point.long || point.lng || point.longitude ? parseFloat(point.long || point.lng || point.longitude) : null;
        
        console.log(`Point ${point.name}: lat=${lat}, lng=${lng}`, point);
        
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for point ${point.name}:`, { lat, lng, point });
          return null;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`Out of range coordinates for point ${point.name}:`, { lat, lng });
          return null;
        }
        
        return {
          ...point,
          lat,
          lng,
          category: point.nearby_categories?.name || point.category,
          propertyId: property.id,
          propertyTitle: property.title,
          uniqueKey: `${property.id}-${point.id || index}`
        };
      })
      .filter(Boolean);
  });
  
  console.log(`Total nearby points found: ${allNearbyPoints.length}`, allNearbyPoints);

  const formatPrice = (price) => {
    if (!price) return "POA";
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
    return `${(price / 1000).toFixed(0)}K`;
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
    if (dist >= 1) return `${dist.toFixed(1)} km`;
    return `${(dist * 1000).toFixed(0)} m`;
  };

  const uniqueCategories = [...new Set(allNearbyPoints.map(p => p.category).filter(Boolean))];

  const toggleFilter = (category) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const visibleNearbyPoints = showNearbyPoints ? allNearbyPoints : [];
  const isPointFiltered = (point) => {
    return activeFilters.length > 0 && !activeFilters.includes(point.category);
  };

  return (
    <div className="relative flex    h-150 rounded-xl overflow-hidden shadow-2xl border border-border">
      <MapContainer
        center={[25.2048, 55.2708]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property Markers */}
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.coordinates.lat, property.coordinates.lng]}
            icon={createPropertyMarker(
              property.starting_price || 0,
              hoveredProperty?.id === property.id || selectedProperty?.id === property.id,
              property.isFeatured
            )}
            eventHandlers={{
              click: () => setSelectedProperty(property),
              mouseover: () => setHoveredProperty(property),
              mouseout: () => setHoveredProperty(null),
            }}
          />
        ))}

        {/* Nearby Points */}
        {visibleNearbyPoints.map((point) => (
          <Marker
            key={point.uniqueKey}
            position={[point.lat, point.lng]}
            icon={createNearbyMarker(point.category, isPointFiltered(point))}
          >
            <Popup maxWidth={280} className="nearby-popup">
              <div className="p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  {/* <div className="p-1.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm leading-tight ">{point.name}</h4>
                    {point.category && (
                      <span className="inline-block px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-semibold rounded-full mt-0.5">
                        {point.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {point.distance_in_km && (
                    <div className="flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-blue-600" />
                      <span className="font-semibold">{point.distance_in_km} km</span>
                    </div>
                  )}
                  {point.distance_in_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-green-600" />
                      <span className="font-semibold">{point.distance_in_minutes} min</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-4 z-[1000] pointer-events-none">
        {/* Stats Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 pointer-events-auto border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Properties</p>
              <p className="text-lg font-bold text-primary">{propertiesWithCoords.length}</p>
            </div>
          </div>
        </div>

        {/* Nearby Toggle */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 pointer-events-auto border border-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showNearbyPoints}
              onChange={(e) => setShowNearbyPoints(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-medium">
              Nearby Points ({allNearbyPoints.length})
            </span>
          </label>
        </div>
      </div>

      {/* Category Filters - Always visible when nearby points exist */}
      {uniqueCategories.length > 0 && (
        <div className={`absolute top-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-[1000] max-w-[220px] border border-border transition-opacity ${!showNearbyPoints ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Filter by Category
          </p>
          <div className="space-y-1.5">
            {uniqueCategories.map(category => {
              const categoryConfig = {
                school: { color: '#10b981', label: 'Schools' },
                hospital: { color: '#ef4444', label: 'Hospitals' },
                mall: { color: '#8b5cf6', label: 'Shopping' },
                restaurant: { color: '#f59e0b', label: 'Dining' },
                transport: { color: '#06b6d4', label: 'Transport' },
                park: { color: '#22c55e', label: 'Parks' },
                gym: { color: '#f97316', label: 'Fitness' },
                mosque: { color: '#7c3aed', label: 'Mosques' },
                beach: { color: '#0ea5e9', label: 'Beaches' },
                default: { color: '#6b7280', label: category }
              };
              const config = categoryConfig[category?.toLowerCase()] || categoryConfig.default;
              const isActive = activeFilters.includes(category);
              const count = allNearbyPoints.filter(p => p.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  disabled={!showNearbyPoints}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                    isActive 
                      ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                      : 'hover:bg-muted border-2 border-transparent hover:border-border'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-medium flex-1">{config.label}</span>
                  <span className="text-xs font-bold text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="w-full mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Hovering Property Card - Compact */}
      {hoveredProperty && !selectedProperty && (
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-2xl overflow-hidden z-[1000] w-[300px] border-2 border-primary/20 animate-in slide-in-from-bottom-2">
          <div className="relative h-36">
            <img
              src={getFeaturedImage(hoveredProperty)}
              alt={hoveredProperty.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {hoveredProperty.isFeatured && (
              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                ⭐ Featured
              </span>
            )}
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
              AED {formatPrice(hoveredProperty.starting_price)}
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-bold text-sm line-clamp-1 mb-1">{hoveredProperty.title}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{hoveredProperty.communities?.name || "Dubai"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs mb-3">
              {hoveredProperty.bedrooms && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bed className="h-3 w-3" />
                  <span className="font-semibold">{hoveredProperty.bedrooms}</span>
                </div>
              )}
              {hoveredProperty.bathrooms && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bath className="h-3 w-3" />
                  <span className="font-semibold">{hoveredProperty.bathrooms}</span>
                </div>
              )}
              {hoveredProperty.size_range && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Maximize className="h-3 w-3" />
                  <span className="font-semibold text-xs">{hoveredProperty.size_range}</span>
                </div>
              )}
            </div>

            <Link href={`/properties/${hoveredProperty.id}`}>
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 font-semibold shadow-sm hover:shadow-md">
                View Details
                <ChevronRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Selected Property Card - Premium Expanded */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden z-[1000] border-2 border-primary/30 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-3 right-3 z-10 bg-white/95 hover:bg-white rounded-full p-2 transition-all shadow-lg hover:shadow-xl"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>

          <div className="relative h-52">
            <img
              src={getFeaturedImage(selectedProperty)}
              alt={selectedProperty.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute top-3 left-3 flex gap-2">
              {selectedProperty.isFeatured && (
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1">
                  ⭐ Featured
                </span>
              )}
              {selectedProperty.property_types?.name && (
                <span className="bg-white/95 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                  {selectedProperty.property_types.name}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-0.5">Starting Price</p>
                <p className="text-2xl font-bold text-primary">
                  AED {formatPrice(selectedProperty.starting_price)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-lg line-clamp-2 mb-2 leading-tight">{selectedProperty.title}</h3>
            
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="line-clamp-1 font-medium">{selectedProperty.communities?.name || "Dubai"}</span>
            </div>

            {/* Property Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b">
              {selectedProperty.bedrooms && (
                <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg">
                  <Bed className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Beds</p>
                  <p className="font-bold text-sm">{selectedProperty.bedrooms}</p>
                </div>
              )}
              {selectedProperty.bathrooms && (
                <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg">
                  <Bath className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-muted-foreground">Baths</p>
                  <p className="font-bold text-sm">{selectedProperty.bathrooms}</p>
                </div>
              )}
              {selectedProperty.size_range && (
                <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
                  <Maximize className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-bold text-xs leading-tight">{selectedProperty.size_range}</p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-2 mb-4">
              {selectedProperty.handover && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Handover:</span>
                  <span className="font-semibold">{selectedProperty.handover}</span>
                </div>
              )}
              {selectedProperty.roi && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Expected ROI:</span>
                  <span className="font-semibold text-green-600">{selectedProperty.roi}%</span>
                </div>
              )}
            </div>

            <Link href={`/properties/${selectedProperty.id}`}>
              <button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Home className="h-4 w-4" />
                View Full Details
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Custom Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}
          className="bg-white hover:bg-muted w-11 h-11 rounded-xl shadow-lg flex items-center justify-center font-bold text-xl transition-all border border-border hover:border-primary hover:shadow-xl"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}
          className="bg-white hover:bg-muted w-11 h-11 rounded-xl shadow-lg flex items-center justify-center font-bold text-xl transition-all border border-border hover:border-primary hover:shadow-xl"
        >
          −
        </button>
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .nearby-icon:hover {
          transform: scale(1.2);
        }
        .property-marker {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 400;
        }
        .property-marker:hover {
          z-index: 1000 !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        @keyframes slide-in-from-bottom-2 {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-2 {
          animation-name: slide-in-from-bottom-2;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
      `}</style>
    </div>
  );
};

export default MapView;