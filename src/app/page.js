"use client";

import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import Link from "next/link";

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

  const renderProperties = (properties) =>
    properties.length
      ? properties.map((property) => <PropertyCard key={property.id} {...property} />)
      : <p className="text-center text-muted-foreground">No properties found.</p>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />

        {/* 🏠 Featured Properties */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Properties</h2>
            </div>
            {loading ? <p className="text-center text-muted-foreground">Loading properties...</p> :
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {renderProperties(featuredProperties)}
              </div>
            }
            <div className="text-center">
              <Link href="/properties">
                <Button size="lg" className="bg-primary hover:bg-primary-light">View All Properties</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 🏡 Properties for Sale */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Properties for Sale</h2>
            </div>
            {loading ? <p className="text-center text-muted-foreground">Loading properties...</p> :
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {renderProperties(buyProperties)}
              </div>
            }
            <div className="text-center">
              <Link href="/properties?category=Buy">
                <Button size="lg" variant="outline">View All Properties for Sale</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 🏘️ Properties for Rent */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Properties for Rent</h2>
            </div>
            {loading ? <p className="text-center text-muted-foreground">Loading properties...</p> :
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {renderProperties(rentProperties)}
              </div>
            }
            <div className="text-center">
              <Link href="/properties?category=Rent">
                <Button size="lg" variant="outline">View All Rentals</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
