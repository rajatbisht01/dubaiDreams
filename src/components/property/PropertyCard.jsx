"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Bed, Square, Calendar, Building2, ChevronLeft, ChevronRight, Star, TrendingUp, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePropertyStore } from '@/store/propertyStore';

const PropertyCard = ({ property, viewMode = "grid" }) => {
  const formatPrice = usePropertyStore(state => state.formatPrice);
  const currency = usePropertyStore(state => state.currency);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(true);
 console.log("property in property card: ",property);
  if (!property) return null;

  const {
    id,
    title = "Untitled Property",
    starting_price,
    property_images = [],
    property_types,
    communities,
    bedrooms,
    size_range,
    developers,
    handover,
    isFeatured,
    property_status_types,
    property_views = [],
    estimated_yield,
    roi,
  } = property;

  const images = property_images.length
    ? property_images.map((img) => ({ url: img.image_url, alt: title }))
    : [{ url: "/assets/property-1.jpg", alt: title }];

  const propertyType = property_types?.name || "";
  const location = communities?.name || "";
  const developer = developers?.name || "";
  const status = property_status_types?.name || "Off-Plan";

  const formatBedrooms = (beds) => {
    if (!beds) return null;
    const bedsStr = beds.toString().trim();
    if (bedsStr.includes(',') || bedsStr.includes('&')) {
      return bedsStr.replace(/\s/g, '').replace(/,/g, '-').replace(/&/g, '-') + ' BR';
    }
    return bedsStr.includes('-') ? bedsStr + ' BR' : bedsStr + ' BR';
  };

  const formattedPrice = useMemo(() => {
    return starting_price ? formatPrice(starting_price) : "POA";
  }, [starting_price, formatPrice, currency]);

  useEffect(() => {
    if (!autoplayActive || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [autoplayActive, images.length]);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAutoplayActive(false);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAutoplayActive(false);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setAutoplayActive(false);
    setCurrentImageIndex(index);
  };

  return (
    <Link href={`/properties/${id}`}>
      <Card
        className="group overflow-hidden w-full bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full rounded-xl shadow-card hover:shadow-card-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setAutoplayActive(true);
        }}
      >
        {/* Image Carousel */}
        <div className="relative h-56 overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: [0.4, 0.0, 0.2, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${images[currentImageIndex].url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            {status && (
              <div className="bg-accent text-accent-foreground px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
                {status}
              </div>
            )}
            {isFeatured && (
              <div className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold shadow-premium backdrop-blur-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>

          {/* Navigation */}
          {images.length > 1 && isHovered && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all">
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all">
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </button>
            </>
          )}

          {/* Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImageIndex ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-premium backdrop-blur-sm">
            <div className="text-sm font-bold">{formattedPrice}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col bg-card">
          {/* Title */}
          <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          
          {/* Location & Type */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            {location && (
              <>
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-medium text-muted truncate">{location}</span>
              </>
            )}
            {propertyType && (
              <Badge variant="outline" className="text-[10px] flex-shrink-0 border-primary/30">
                {propertyType}
              </Badge>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-2 mb-3 py-2 border-y border-border">
            {bedrooms && (
              <div className="text-center">
                <Bed className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted" />
                <div className="text-[10px] font-bold text-text">{formatBedrooms(bedrooms)}</div>
              </div>
            )}
            {size_range && (
              <div className="text-center">
                <Square className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted" />
                <div className="text-[10px] font-bold text-text">{size_range}</div>
              </div>
            )}
            {(estimated_yield || roi) && (
              <div className="text-center">
                <TrendingUp className="w-3.5 h-3.5 mx-auto mb-0.5 text-accent" />
                <div className="text-[10px] font-bold text-accent">
                  {estimated_yield ? `${estimated_yield}%` : roi ? `${roi}%` : 'N/A'}
                </div>
              </div>
            )}
            {handover && (
              <div className="text-center">
                <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" />
                <div className="text-[10px] font-bold text-text">{handover}</div>
              </div>
            )}
          </div>

          {/* Views */}
          {property_views.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {property_views.slice(0, 2).map((v, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-[9px] font-medium">
                  <Eye className="w-2.5 h-2.5" />
                  {v.view_types?.name || v.view?.name}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
            <span className="text-xs font-medium text-muted truncate">{developer}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;