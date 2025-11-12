"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Grid3x3,
  List,
  Map,
} from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";

const amenitiesList = [
  "Covered / Secure Parking",
  "Elevator / Lift",
  "24/7 Security & CCTV",
  "High-speed Internet / Wi-Fi",
  "Central Air-Conditioning",
  "Balcony / Terrace",
  "Swimming Pool (Shared or Private)",
  "Gym / Fitness Centre",
  "Spa / Sauna / Wellness Centre",
  "Rooftop Terrace / Lounge",
  "Landscaped Garden / Outdoor Seating",
  "Children’s Play Area / Family Zone",
  "Pet-friendly Facilities",
  "Smart Home Automation (lighting, HVAC, security)",
  "Co-working / Business Lounge / Meeting Room",
  "Retail / Dining Access On-site or Nearby",
  "Easy Metro / Transport Access",
  "Waterfront / Marina / Scenic View (if applicable)",
  "Private Beach / Lagoon or Waterfront Access",
  "EV Charging Station / Green Features",
  "Maid’s / Utility Room",
  "Concierge / Housekeeping Services",
];

const PropertiesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔍 Filter States
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [beds, setBeds] = useState(searchParams.get("beds") || "any");
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 5000000,
  ]);
  const [amenities, setAmenities] = useState(
    searchParams.get("amenities") ? searchParams.get("amenities").split(",") : []
  );
  const [furnishing, setFurnishing] = useState(
    searchParams.get("furnishing") ? searchParams.get("furnishing").split(",") : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "featured");

  // 📊 Data States
  const [viewMode, setViewMode] = useState("grid");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Sync filters with URL params
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType && propertyType !== "all") params.set("propertyType", propertyType);
    if (category && category !== "all") params.set("category", category);
    if (beds && beds !== "any") params.set("beds", beds);
    if (priceRange) {
      params.set("minPrice", priceRange[0]);
      params.set("maxPrice", priceRange[1]);
    }
    if (amenities.length) params.set("amenities", amenities.join(","));
    if (furnishing.length) params.set("furnishing", furnishing.join(","));
    if (sortBy) params.set("sortBy", sortBy);

    router.replace(`/properties?${params.toString()}`);
  };

  // ✅ Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("properties")
        .select("*, agent:profiles(*)")
        .eq("deleted", false)
        .eq("status", "active");

      if (location)
        query = query.or(
          `emirate.ilike.%${location}%,community.ilike.%${location}%,address.ilike.%${location}%`
        );

      if (propertyType && propertyType !== "all") query = query.eq("type", propertyType);

      if (category && category !== "all" && ["Buy", "Rent"].includes(category))
        query = query.eq("category", category);

      if (beds && beds !== "any") query = query.gte("bedrooms", parseInt(beds));

      if (priceRange) query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

      if (amenities.length) query = query.contains("amenities", amenities);

      if (furnishing.length) query = query.contains("furnishing", furnishing);

      if (sortBy === "price-low") query = query.order("price", { ascending: true });
      else if (sortBy === "price-high") query = query.order("price", { ascending: false });
      else if (sortBy === "newest") query = query.order("created_at", { ascending: false });
      else query = query.order("is_featured", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const formatted = data.map((p) => ({
        ...p,
        images: p.images ? p.images.map((url) => ({ url, alt_text: p.title })) : [],
      }));

      setProperties(formatted);
    } catch (err) {
      console.error("[Properties] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch on filter change
  useEffect(() => {
    updateSearchParams();
    fetchProperties();
  }, [location, propertyType, category, beds, priceRange, amenities, furnishing, sortBy]);

  const toggleAmenity = (amenity) =>
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );

  const toggleFurnishing = (option) =>
    setFurnishing((prev) =>
      prev.includes(option) ? prev.filter((f) => f !== option) : [...prev, option]
    );



  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* 🔹 Filters Section */}
        <section className="pb-8 px-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Browse Properties
            </h1>

            <div className="bg-card rounded-lg p-4 shadow-medium mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Location */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by city, community or building..."
                    className="pl-10 h-12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Type */}
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="md:w-48 h-12">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Off-plan">Off-plan</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="md:w-48 h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bedrooms */}
                <Select value={beds} onValueChange={setBeds}>
                  <SelectTrigger className="md:w-48 h-12">
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filters Drawer */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <SlidersHorizontal className="mr-2 h-5 w-5" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-white overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>Refine your property search</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 mt-6">
                      {/* Price */}
                      <div>
                        <Label className="mb-3 block">Price Range (AED)</Label>
                        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                          <span>{priceRange[0].toLocaleString()}</span>
                          <span>{priceRange[1].toLocaleString()}</span>
                        </div>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={5000000}
                          step={50000}
                          className="mb-4"
                        />
                      </div>

                      {/* Amenities */}
                      <div>
                        <Label className="mb-3 block">Amenities</Label>
                        <div className="space-y-3">
                          {amenitiesList.map(
                            (amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={amenities.includes(amenity)}
                                  onCheckedChange={() => toggleAmenity(amenity)}
                                />
                                <Label className="text-sm cursor-pointer">{amenity}</Label>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Furnishing */}
                      <div>
                        <Label className="mb-3 block">Furnishing</Label>
                        <div className="space-y-3">
                          {["Furnished", "Unfurnished", "Semi-Furnished"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                checked={furnishing.includes(option)}
                                onCheckedChange={() => toggleFurnishing(option)}
                              />
                              <Label className="text-sm cursor-pointer">{option}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button className="h-12 bg-primary" onClick={fetchProperties}>
                  <Search className="mr-2 h-5 w-5" /> Search
                </Button>
              </div>
            </div>

            {/* Sort & View */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{properties.length}</span> properties found
              </p>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🏠 Properties Display */}
        <section className="py-4 px-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center text-lg text-muted-foreground">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-center text-lg text-muted-foreground">No properties found.</div>
            ) : viewMode === "map" ? (
              <div className="text-center text-muted-foreground">Map view not enabled.</div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PropertiesPage;
