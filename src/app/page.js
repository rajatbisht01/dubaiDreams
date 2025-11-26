"use client";

import { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import HeroCarousel from "@/components/home/HeroCarousel";
import { Award,Shield ,TrendingUp, Users } from "lucide-react";
import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { allProperties, caroueselProperties, fetchProperties, loading } = usePropertyStore();
  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    const loadProperties = async () => {
      // Fetch first page with 10 properties (or any number)
      const properties = await fetchProperties(1, 10);

      // Filter featured properties
      const featured = properties.filter((p) => p.isFeatured);
      setFeaturedProperties(featured);
    };

    loadProperties();
  }, [fetchProperties]);
 console.log("Featured Properties:", featuredProperties);
  console.log("all caroueselProperties:", caroueselProperties);

 return (
    <>
      {/* Hero Carousel with featured properties */}
      <HeroCarousel featuredProperties={featuredProperties} />

    {/* <Hero /> */}

     <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why Invest in Dubai?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dubai offers unparalleled opportunities for property investors worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-luxury hover:shadow-gold transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">High ROI</h3>
                <p className="text-muted-foreground">Average returns of 8-15% annually with strong capital appreciation.</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-luxury hover:shadow-gold transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tax-Free Income</h3>
                <p className="text-muted-foreground">No property tax, income tax, or capital gains tax on your investments.</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-luxury hover:shadow-gold transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Flexible Payment</h3>
                <p className="text-muted-foreground">Developer payment plans with 20-40% down and installments during construction.</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-luxury hover:shadow-gold transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Golden Visa</h3>
                <p className="text-muted-foreground">Qualify for UAE residency visa with property investments over AED 2M.</p>
              </div>
            </div>
          </div>
        </section>

    {/* 🏠 all Properties */}
    <section className="p-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Off-Plan Properties</h2>
          <p className="text-lg text-muted-foreground">Handpicked listings you don't want to miss</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading properties...</p>
        ) : (
          <AnimatedPropertyGrid properties={allProperties} viewMode={"grid"} />
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

  
 
</>

  );
}
