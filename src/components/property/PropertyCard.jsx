"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import Carousel from "../ui/carousel"; // import your existing carousel

const PropertyCard = ({ property,viewMode='grid', }) => {
  if (!property) return null;

  const {
    id,  
    title = "Untitled Property",
    starting_price,
    property_images = [],
    property_types,
    communities,
    bedrooms,
    bathrooms,
    size_range,
    developers,
    handover,
    isFeatured,
    property_status_types,
    property_views = [],
  } = property;

  const images = property_images.length
    ? property_images.map((img) => ({ url: img.image_url, alt: title }))
    : [{ url: "/assets/property-1.jpg", alt: title }];

  const propertyType = property_types?.name || "Unknown Type";
  const location = communities?.name || "Unknown Location";
  const developer = developers?.name || "Unknown Developer";
  const status = property_status_types?.name || "Off-Plan";

  return (
    <Link href={`/properties/${id}`}>
      <Card className="group overflow-hidden w-full hover:shadow-luxury transition-all duration-300 cursor-pointer flex flex-col h-full">
        {/* Image / Carousel */}
        <div className={`relative overflow-hidden ${viewMode ==='grid'? 'aspect-[4/3] h-[180px]' : '' }  `}>
          {images.length > 1 ? (
            <Carousel
              items={images}
              baseWidth="100%"
              height={850}
              autoplay={true}
              autoplayDelay={3000}
              pauseOnHover={true}
              loop={true}
              gap={0}
            />
          ) : (
            <img
              src={images[0].url}
              alt={images[0].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}

          {/* Status Badge */}
          {status && (
            <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              {status}
            </div>
          )}

          {/* Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          {/* Title & Price */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="font-bold text-accent text-lg">
                {starting_price ? `AED ${Number(starting_price).toLocaleString()}` : "Price N/A"}
              </p>
            </div>

            {/* Location & Type */}
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{location}</span>
              {propertyType && (
                <Badge variant="outline" className="ml-2 text-xs">{propertyType}</Badge>
              )}
            </div>

            {/* Specs */}
            <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
              {bedrooms && <div className="flex items-center"><Bed className="h-4 w-4 mr-1" />{bedrooms}</div>}
              {bathrooms && <div className="flex items-center"><Bath className="h-4 w-4 mr-1" />{bathrooms}</div>}
              {size_range && <div className="flex items-center"><Square className="h-4 w-4 mr-1" />{size_range} sq ft</div>}
            </div>

            {/* Views */}
            {property_views.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {property_views.map((v, idx) => (
                  <Badge key={idx} variant="outline" className="px-2 py-1 text-[10px]">{v.view?.name}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Developer & Handover */}
          <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Developer:</span> {developer}
            </span>
            {handover && (
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Handover:</span> {handover}
              </span>
            )}
          </div>

          {/* Featured Badge */}
          {isFeatured && (
            <div className="mt-2">
              <Badge className="bg-primary hover:bg-primary-light">Featured</Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;
