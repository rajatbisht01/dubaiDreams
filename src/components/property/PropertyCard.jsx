"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Heart,
  Share2,
  Phone,
  Mail,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";

const PropertyCard = ({
  id,
  title,
  price,
  images,
  type,
  address,
  area_sqft,
  bedrooms,
  bathrooms,
  is_featured,
  verified,
  agent,
  ...rest
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const { setSelectedProperty } = usePropertyStore();
  const router = useRouter();

  const handleClick = () => {
    // Save this property globally in Zustand before navigation
    setSelectedProperty({
      id,
      title,
      price,
      images,
      type,
      address,
      area_sqft,
      bedrooms,
      bathrooms,
      is_featured,
      verified,
      agent,
      ...rest,
    });

    // Navigate to dynamic page
    router.push(`/properties/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden hover:shadow-large transition-all duration-300 group h-full flex flex-col cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={images?.[0]?.url || "/assets/property-1.jpg"}
          alt={images?.[0]?.alt_text || title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {is_featured && (
            <Badge className="bg-primary hover:bg-primary-light">Featured</Badge>
          )}
          {verified && (
            <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className="absolute top-4 right-4 flex gap-2"
          onClick={(e) => e.stopPropagation()} // prevent parent click
        >
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-10 h-10 bg-white hover:bg-white/90"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Heart
              className={`h-5 w-5 ${
                isSaved ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-10 h-10 bg-white hover:bg-white/90"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Title & Info */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 text-xs">
                {type}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{address}</span>
          </div>

          {/* Price & Area */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-primary">
              ${price?.toLocaleString()}
            </div>
            {area_sqft && (
              <div className="text-sm text-muted-foreground">{area_sqft} sq ft</div>
            )}
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
            {bedrooms !== undefined && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms !== undefined && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area_sqft && (
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-1" />
                <span>{area_sqft}</span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Info */}
        {agent && (
          <div className="border-t border-border pt-3 mt-auto">
            <div className="flex items-center justify-between">
              <Link
                href={`/agent/${agent.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()} // prevent triggering card click
              >
                <img
                  src={agent.image || "/placeholder-agent.jpg"}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {agent.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {agent.company}
                  </div>
                </div>
              </Link>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
