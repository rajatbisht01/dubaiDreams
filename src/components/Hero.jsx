"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Building, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/propertyStore";

const Hero = () => {
  const router = useRouter();
  
  const {
    propertyTypes,
    categories,
    communities,
    fetchFilters
  } = usePropertyStore();

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [community, setCommunity] = useState("all");
  const [beds, setBeds] = useState("any");

  // Load filters on mount
  useEffect(() => {
    fetchFilters();
  }, []);

  const handleSearch = () => {
    // Build query string dynamically
    const params = new URLSearchParams();
    
    if (search) params.append("search", search);
    if (propertyType !== "all") params.append("propertyType", propertyType);
    if (status !== "all") params.append("category", status);
    if (community !== "all") params.append("community", community);
    if (beds !== "any") params.append("beds", beds);

    router.push(`/properties?${params.toString()}`);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative my-8 flex items-center bg-transparent">
      {/* Optional Background Image - Uncomment if needed */}
      {/* <div className="absolute inset-0 opacity-80">
        <Image
          src="/assets/hero-image.jpg"
          alt="Dubai Properties"
          fill
          className="object-cover"
          priority
        />
      </div> */}

      <div className="relative container mx-auto px-4 py-2">
        <div className="max-w-5xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-8 animate-in fade-in duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-black">
              Find Your Dream Property in Dubai
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover exclusive off-plan and ready properties from top developers
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl border animate-in fade-in duration-700 delay-100">
            <div className="space-y-4">
              {/* Main Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by location, community, or developer..."
                      className="pl-10 h-12 bg-background"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="md:col-span-3">
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {propertyTypes?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="md:col-span-3">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                    size="lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Additional Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Status */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {categories?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Community */}
                <Select value={community} onValueChange={setCommunity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Communities</SelectItem>
                    {communities?.slice(0, 20).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bedrooms */}
                <Select value={beds} onValueChange={setBeds}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Bedrooms</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4 Bedrooms</SelectItem>
                    <SelectItem value="5+">5+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Links */}
              {/* <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setCommunity(communities?.find(c => c.name.toLowerCase().includes("marina"))?.id || "all");
                    handleSearch();
                  }}
                >
                  Dubai Marina
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setCommunity(communities?.find(c => c.name.toLowerCase().includes("downtown"))?.id || "all");
                    handleSearch();
                  }}
                >
                  Downtown Dubai
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setPropertyType(propertyTypes?.find(t => t.name.toLowerCase().includes("villa"))?.id || "all");
                    handleSearch();
                  }}
                >
                  Villas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setStatus(categories?.find(c => c.name.toLowerCase().includes("off"))?.id || "all");
                    handleSearch();
                  }}
                >
                  Off-Plan
                </Button>
              </div> */}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-700 delay-200">
            {[
              { icon: Home, value: "500+", label: "Properties", color: "text-blue-500" },
              { icon: Building, value: "50+", label: "Developers", color: "text-purple-500" },
              { icon: DollarSign, value: "AED 5B+", label: "Worth Listed", color: "text-green-500" },
              { icon: TrendingUp, value: "15%", label: "Avg. ROI", color: "text-orange-500" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/50 backdrop-blur-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Trusted Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;