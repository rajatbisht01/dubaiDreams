"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hero = () => {
  const router = useRouter();
  const [category, setCategory] = useState("Rent");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [beds, setBeds] = useState("");

  const handleSearch = () => {
    // Build query string dynamically
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (propertyType) params.append("propertyType", propertyType);
    if (beds) params.append("beds", beds);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative h-[650px] flex items-center">
      <div className="absolute inset-0">
        <Image
          src={"/assets/hero-image.jpg"}
          alt="Dubai Properties"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.6)" }}
          priority
        />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 text-center animate-in fade-in duration-700">
            Your home search starts here
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 text-center animate-in fade-in duration-700 delay-100">
            Find properties to rent, buy or invest
          </p>

          <div className="bg-white rounded-xl p-2 shadow-large animate-in fade-in duration-700 delay-200">
            {/* ✅ Use correct state for Tabs */}
            <Tabs value={category} onValueChange={setCategory} className="p-2">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="Rent" className="text-sm">Rent</TabsTrigger>
                <TabsTrigger value="Buy" className="text-sm">Buy</TabsTrigger>
                {/* <TabsTrigger value="newProject" className="text-sm">New Projects</TabsTrigger>
                <TabsTrigger value="commercial" className="text-sm">Commercial</TabsTrigger> */}
              </TabsList>

              <TabsContent value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-2">
                  {/* Location Input */}
                  <div className="md:col-span-5">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="City, community or building"
                        className="pl-10 h-12 bg-secondary border-0"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="md:col-span-3">
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="h-12 border-0">
                        <SelectValue placeholder="Property type" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Beds */}
                  <div className="md:col-span-2">
                    <Select value={beds} onValueChange={setBeds}>
                      <SelectTrigger className="h-12 border-0">
                        <SelectValue placeholder="Beds & Baths" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1+ Bed</SelectItem>
                        <SelectItem value="2">2+ Beds</SelectItem>
                        <SelectItem value="3">3+ Beds</SelectItem>
                        <SelectItem value="4">4+ Beds</SelectItem>
                        <SelectItem value="5">5+ Beds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-2">
                    <Button
                      onClick={handleSearch}
                      className="w-full h-12 bg-primary hover:bg-primary-light text-white font-semibold"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Search
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Section */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-700 delay-300">
            {[
              { icon: Home, value: "50,000+", label: "Properties" },
              { icon: Building, value: "5,000+", label: "Agents" },
              { icon: DollarSign, value: "$5B+", label: "Worth Listed" },
              { icon: Search, value: "1M+", label: "Monthly Searches" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mb-2">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-white/80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
