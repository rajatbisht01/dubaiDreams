'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroCarousel({ featuredProperties = [] }) {
  // Build slides: one per property, first image only
  const slides = useMemo(() => {
    if (!Array.isArray(featuredProperties) || featuredProperties.length === 0) {
      return [{
        image: '/assets/placeholder.jpg',
        title: 'Unknown Property',
        price: 'Price N/A',
        developer: 'Unknown Developer',
        location: '',
        bedrooms: '-',
        bathrooms: '-',
      }];
    }

    return featuredProperties.map(property => ({
      image: property?.property_images?.[0]?.image_url || '/assets/placeholder.jpg',
      title: property.title ?? 'Untitled Property',
      price: property.starting_price ? `AED ${property.starting_price.toLocaleString()}` : 'Price N/A',
      developer: property.developers?.name ?? 'Unknown Developer',
      location: property.communities?.name ?? '',
      bedrooms: property.bedrooms ?? '-',
      bathrooms: property.bathrooms ?? '-',
    }));
  }, [featuredProperties]);

  const [[currentSlide, direction], setCurrentSlide] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = (dir) => {
    setCurrentSlide(([prev]) => {
      const next = (prev + dir + slides.length) % slides.length;
      return [next, dir];
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3500);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const slide = slides[currentSlide];

  return (
   <section className="relative h-screen w-full overflow-x-hidden overflow-y-hidden">
  {/* Left Fixed Content */}
  <div className="absolute gap-10 top-0 left-0 z-10 h-full flex flex-col justify-center px-10 lg:px-22 pointer-events-none">
    <h1 className="text-5xl lg:text-7xl max-w-4xl font-bold text-white mb-4">
      Discover Dubai's Luxury Properties
    </h1>
    <p className="text-xl lg:text-2xl text-white/90 mb-6">
      Your gateway to off-plan projects, zero commission & flexible payment plans.
    </p>
    <Button
      className="bg-primary text-white px-6 py-4 rounded-xl text-lg w-max pointer-events-auto"
      onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: "smooth" })}
    >
      Know More
    </Button>
  </div>

  {/* Background Carousel */}
  <AnimatePresence initial={false} custom={direction}>
    <motion.div
      key={currentSlide}
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.6 }}
      style={{ overflow: "hidden" }}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Bottom-right info */}
      <div className="absolute bottom-30 right-25 bg-black/70 p-6 rounded-xl max-w-sm text-white shadow-lg">
        <h2 className="text-2xl font-bold">{slide.title}</h2>
        <p className="text-sm text-gray-300">{slide.developer}</p>
        <p className="text-lg font-semibold mt-2">{slide.price}</p>
        {slide.location && <p className="text-sm text-gray-200 mt-1">{slide.location}</p>}
        <p className="text-sm text-gray-200 mt-1">
          {slide.bedrooms} Beds • {slide.bathrooms} Baths
        </p>
      </div>
    </motion.div>
  </AnimatePresence>

  {/* Arrows */}
  <button
    onClick={() => paginate(-1)}
    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/30 hover:scale-110 transition-all"
  >
    <ChevronLeft className="h-6 w-6" />
  </button>

  <button
    onClick={() => paginate(1)}
    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/30 hover:scale-110 transition-all"
  >
    <ChevronRight className="h-6 w-6" />
  </button>

</section>

  );
}
