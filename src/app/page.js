"use client";

import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import HeroCarousel from "@/components/home/HeroCarousel";
import { Award,Shield ,TrendingUp, Users } from "lucide-react";
import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import { motion } from "framer-motion";

export default function HomePage() {
  const { allProperties, carouselProperties, featuredProperties,fetchFeaturedProperties, fetchCarouselProperties, fetchProperties, loading } = usePropertyStore();

useEffect(() => {
  ( () => {
    fetchCarouselProperties();
     fetchProperties();
    fetchFeaturedProperties();
  })();
}, []);
 
  
  console.log("Featured Properties:", featuredProperties);
  console.log("all caroueselProperties:", carouselProperties);

 return (
    <div className="flex flex-col ">
      {/* Hero Carousel with featured properties */}
      <HeroCarousel featuredProperties={carouselProperties} />


  
     <section className="p-8 bg-muted/30">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {[
    {
      title: "High ROI",
      desc: "Average returns of 8-15% annually with strong capital appreciation.",
      icon: Award,
    },
    {
      title: "Tax-Free Income",
      desc: "No property tax, income tax, or capital gains tax on your investments.",
      icon: Shield,
    },
    {
      title: "Flexible Payment",
      desc: "Developer payment plans with 20-40% down and installments during construction.",
      icon: TrendingUp,
    },
    {
      title: "Golden Visa",
      desc: "Qualify for UAE residency visa with property investments over AED 2M.",
      icon: Users,
    },
  ].map((item, index) => (
    <motion.div
      key={item.title}
      className="gradient-border"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
        transitionBehavior: "startToEnd",
      }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="group bg-white p-8 rounded-2xl h-full shadow-2xl hover:border-none transition-all duration-300">
        <div className="w-8 h-8  rounded-full flex items-center justify-center mb-6">
          <item.icon className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-xl group-hover:text-primary font-bold mb-3">{item.title}</h3>
        <p className="text-muted-foreground">{item.desc}</p>
      </div>
    </motion.div>
  ))}
</div>

        </section>
  <Hero />
    {/* 🏠 featured Properties */}
    <section className="px-8 bg-background my-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Off-Plan Properties</h2>
          <p className="text-lg text-muted-foreground">Handpicked listings you don't want to miss</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={featuredProperties} viewMode={"grid"} />
        )}
        <div className="text-center mt-4">
          <Link href="/properties">
            <Button size="lg" className="bg-primary hover:bg-primary-light mt-4">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>

   <section className="px-8 bg-background mb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Explore All Properties</h2>
          <p className="text-lg text-muted-foreground">Handpicked listings you don't want to miss</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={allProperties} viewMode={"grid"} />
        )}
        <div className="text-center mt-4">
          <Link href="/properties">
            <Button size="lg" className="bg-primary hover:bg-primary-light mt-4">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
 
</div>

  );
}
