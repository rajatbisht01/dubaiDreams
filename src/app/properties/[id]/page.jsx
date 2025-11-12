"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePropertyStore } from "@/store/propertyStore";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Home,
  Sofa,
} from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";

const PropertyDetail = () => {
  const params = useParams();
  const id = params?.id;
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Zustand store
  const { selectedProperty,fetchAllProperties, fetchPropertyById, allProperties, loading } =
    usePropertyStore();
    console.log("allProperties ****************", allProperties )

    const [property, setProperty] = useState(null);
    
    useEffect(() => {
      
      const loadProperty = async () => {
        if (selectedProperty && selectedProperty.id === id) {
          setProperty(selectedProperty);
        } else {
          const fetched = await fetchPropertyById(id);
          if (fetched) setProperty(fetched);
        }
    };
    loadProperty();
  }, [id, selectedProperty]);

  const nextImage = () =>
    setCurrentImage((prev) =>
      property?.images?.length ? (prev + 1) % property.images.length : prev
    );

  const prevImage = () =>
    setCurrentImage((prev) =>
      property?.images?.length
        ? (prev - 1 + property.images.length) % property.images.length
        : prev
    );

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading property details...
      </div>
    );
  }

  const similarProperties =
    allProperties?.filter(
      (p) => p.id !== property.id && p.type === property.type
    ) || [];


  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">
        {/* 🖼 Image Gallery */}
        <div className="relative h-[500px] md:h-[600px] bg-black">
          <img
            src={property.images?.[currentImage]?.url || "/fallback.jpg"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Controls */}
          {property.images?.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentImage + 1} / {property.images?.length}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/90 hover:bg-white"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart
                className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : ""}`}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/90 hover:bg-white"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 🏠 Property Info */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {property.type} • {property.category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">
                      {property.address ||
                        property.subcommunity ||
                        property.community ||
                        property.emirate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 p-6 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        AED {property.price?.toLocaleString()}
                      </div>
                      {property.area_sqft && (
                        <div className="text-sm text-muted-foreground">
                          AED{" "}
                          {Math.round(property.price / property.area_sqft).toLocaleString()}{" "}
                          / sq ft
                        </div>
                      )}
                    </div>

                    <div className="h-12 w-px bg-border" />

                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold">
                          {property.bedrooms || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bedrooms
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold">
                          {property.bathrooms || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bathrooms
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <div className="font-semibold">
                          {property.area_sqft?.toLocaleString()} sqft
                        </div>
                        <div className="text-xs text-muted-foreground">Area</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose text-muted-foreground whitespace-pre-line">
                          {property.description || "No description available."}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 🧱 Features */}
                  <TabsContent value="features" className="mt-6 space-y-6">
                    {property.amenities?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Amenities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {property.amenities.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {property.furnishing?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sofa className="h-5 w-5 text-primary" />
                            Furnishing
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {property.furnishing.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Similar Properties */}
                {similarProperties.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      Similar Properties
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {similarProperties.map((prop) => (
                        <PropertyCard key={prop.id} {...prop} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {property.agent && (
                  <Card className="top-24">
                    <CardHeader>
                      <CardTitle>Contact Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={property.agent.image || "/placeholder-agent.jpg"}
                          alt={property.agent.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {property.agent.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {property.agent.company}
                          </p>
                        </div>
                      </div>

                      <form className="space-y-3">
                        <Input placeholder="Your Name" />
                        <Input type="email" placeholder="Your Email" />
                        <Input type="tel" placeholder="Your Phone" />
                        <Textarea placeholder="Message" rows={4} />
                        <Button className="w-full bg-primary hover:bg-primary-light">
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
