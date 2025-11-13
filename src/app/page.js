"use client";

import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import Link from "next/link";
import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";

export default function Home() {
  const { allProperties, fetchAllProperties, loading } = usePropertyStore();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [buyProperties, setBuyProperties] = useState([]);
  const [rentProperties, setRentProperties] = useState([]);

  // Fetch all properties if not already fetched
  useEffect(() => {
    if (!allProperties || allProperties.length === 0) {
      fetchAllProperties();
    }
  }, [allProperties, fetchAllProperties]);

  // Filter properties into sections whenever `allProperties` changes
  useEffect(() => {
    if (allProperties?.length) {
      setFeaturedProperties(allProperties.filter((p) => p.is_featured));
      setBuyProperties(allProperties.filter((p) => p.category === "Buy"));
      setRentProperties(allProperties.filter((p) => p.category === "Rent"));
    }
  }, [allProperties]);


  return (
   <div className="min-h-screen bg-background">
  <main>
    <Hero />

    {/* 🏠 Featured Properties */}
    <section className="p-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Properties</h2>
          <p className="text-lg text-muted-foreground">Handpicked listings you don't want to miss</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={featuredProperties} viewMode={"grid"} />
        )}
        <div className="text-center mt-4">
          <Link href="/properties">
            <Button size="lg" className="bg-primary hover:bg-primary-light">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* 🏡 Properties for buy */}
    <section className="p-8 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Properties to buy</h2>
          <p className="text-lg text-muted-foreground">Find your dream home available for purchase</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={buyProperties} viewMode={"grid"} />
        )}
        <div className="text-center mt-4">
          <Link href="/properties?category=Buy">
            <Button size="lg" variant="outline">
              View All Properties to buy
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* 🏘️ Properties for Rent */}
    <section className="p-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Properties for Rent</h2>
          <p className="text-lg text-muted-foreground">Browse rental homes and apartments available now</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={rentProperties} viewMode={"grid"} />
        )}
        <div className="text-center mt-4">
          <Link href="/properties?category=Rent">
            <Button size="lg" variant="outline">
              View All Rentals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </main>
</div>

  );
}
