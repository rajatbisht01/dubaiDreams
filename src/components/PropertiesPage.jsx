"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";

import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";

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
  Search,
  MapPin,
  Grid3x3,
  List,
  Map,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { usePropertyStore } from "@/store/propertyStore";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/property/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-150 flex items-center justify-center">Loading map...</div>
  ),
});

const PropertiesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ----------------------- Pull dynamic lookups from Zustand ----------------------- */
  const {
    propertyTypes,
    categories,
    communities,
    developers,
    amenities,
    fetchFilters,
  } = usePropertyStore();

  /* -------------------------------- Filters -------------------------------- */
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "all"
  );
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [community, setCommunity] = useState(
    searchParams.get("community") || "all"
  );
  const [developer, setDeveloper] = useState(
    searchParams.get("developer") || "all"
  );
  const [beds, setBeds] = useState(searchParams.get("beds") || "any");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "created_at"
  );
  const [sortDir, setSortDir] = useState(searchParams.get("sortDir") || "desc");

  /* ----------------------- Price Range Filter ----------------------- */
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000000,
  ]);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  /* ----------------------- Amenities Filter ----------------------- */
  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    const amenitiesParam = searchParams.get("amenities");
    return amenitiesParam ? amenitiesParam.split(",") : [];
  });

  /* ------------------------------ View Mode ------------------------------ */
  const [viewMode, setViewMode] = useState("grid");

  /* ------------------------- Drawer State ------------------------- */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* ------------------------- API Response State ------------------------- */
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ------------------------------- Pagination ------------------------------- */
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* ----------------------- Active Filters Count ----------------------- */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (propertyType !== "all") count++;
    if (category !== "all") count++;
    if (community !== "all") count++;
    if (developer !== "all") count++;
    if (beds !== "any") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000000) count++;
    if (selectedAmenities.length > 0) count++;
    return count;
  }, [
    search,
    propertyType,
    category,
    community,
    developer,
    beds,
    priceRange,
    selectedAmenities,
  ]);

  /* ----------------------- Build Query Object (Memoized) ----------------------- */
  const queryObj = useMemo(() => {
    const params = {
      page,
      limit,
      sortBy,
      sortDir,
    };

    if (search) params.search = search;
    if (propertyType !== "all") params.propertyType = propertyType;
    if (category !== "all") params.status = category;
    if (community !== "all") params.community = community;
    if (developer !== "all") params.developer = developer;
    if (beds !== "any") params.bedrooms = beds;
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 10000000) params.maxPrice = priceRange[1];
    if (selectedAmenities.length > 0)
      params.amenities = selectedAmenities.join(",");

    return params;
  }, [
    search,
    propertyType,
    category,
    community,
    developer,
    beds,
    sortBy,
    sortDir,
    page,
    priceRange,
    selectedAmenities,
  ]);

  /* ------------------------------ Sync URL ------------------------------ */
  const syncUrl = () => {
    const params = new URLSearchParams();

    Object.entries(queryObj).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "any") {
        params.set(key, value.toString());
      }
    });

    router.replace(`/properties?${params.toString()}`, { scroll: false });
  };

  /* -------------------------- Fetch Properties -------------------------- */
  const fetchProperties = async () => {
    setLoading(true);

    try {
      const res = await axios.get("/api/properties", {
        params: queryObj,
      });

      setProperties(res.data.data.items || []);
      setTotal(res.data.data.meta.total || 0);
      setTotalPages(res.data.data.meta.totalPages || 1);
    } catch (err) {
      console.error("API Error:", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- Clear All Filters -------------------------- */
  const clearAllFilters = () => {
    setSearch("");
    setPropertyType("all");
    setCategory("all");
    setCommunity("all");
    setDeveloper("all");
    setBeds("any");
    setPriceRange([0, 10000000]);
    setTempPriceRange([0, 10000000]);
    setSelectedAmenities([]);
    setPage(1);
    setIsDrawerOpen(false);
  };

  /* -------------------------- Handle Amenity Toggle -------------------------- */
  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  /* ------------- Load filters on mount ------------- */
  useEffect(() => {
    fetchFilters();
  }, []);

  /* ------------- Fetch properties when filters change ------------- */
  useEffect(() => {
    syncUrl();
    fetchProperties();
  }, [queryObj]);

  /* ------------- Reset page when filters change ------------- */
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [
    search,
    propertyType,
    category,
    community,
    developer,
    beds,
    priceRange,
    selectedAmenities,
  ]);

  /* ------------- Handle Sort Change ------------- */
  const handleSortChange = (value) => {
    switch (value) {
      case "featured":
        setSortBy("isFeatured");
        setSortDir("desc");
        break;
      case "price-low":
        setSortBy("starting_price");
        setSortDir("asc");
        break;
      case "price-high":
        setSortBy("starting_price");
        setSortDir("desc");
        break;
      case "newest":
        setSortBy("created_at");
        setSortDir("desc");
        break;
      default:
        setSortBy("created_at");
        setSortDir("desc");
    }
  };

  /* ------------- Format Price ------------- */
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Filters Section */}
        <section className="pb-8 px-4  md:px-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            {/* Page Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center pt-6">
              Browse Properties
            </h1>

            {/* Main Filter Card */}
            <div className="bg-card rounded-lg p-4 shadow mb-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-10 h-12"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Property Type */}
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full md:w-48 h-12">
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

                {/* Category (Status) */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-48 h-12">
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
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Communities</SelectItem>
                    {communities?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* More Filters Button */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="h-12 relative">
                      <SlidersHorizontal className="h-5 w-5 mr-2" />
                      More Filters
                      {activeFiltersCount > 0 && (
                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent className="max-h-screen z-[1000] w-[30vw] p-4">
                    <DrawerHeader>
                      <DrawerTitle className="text-center text-primary text-2xl">
                        Additional Filters
                      </DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-6">
                      {/* Developer */}
                      <div>
                        <Label className="mb-2 block">Developer</Label>
                        <Select value={developer} onValueChange={setDeveloper}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Developers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Developers</SelectItem>
                            {developers?.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bedrooms */}
                      <div>
                        <Label className="mb-2 block">Bedrooms</Label>
                        <Select value={beds} onValueChange={setBeds}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="1">1 Bedroom</SelectItem>
                            <SelectItem value="2">2 Bedrooms</SelectItem>
                            <SelectItem value="3">3 Bedrooms</SelectItem>
                            <SelectItem value="4">4 Bedrooms</SelectItem>
                            <SelectItem value="5+">5+ Bedrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <Label className="mb-2 block ">
                          Price Range: AED {formatPrice(tempPriceRange[0])} -{" "}
                          {formatPrice(tempPriceRange[1])}
                        </Label>
                        <div
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerMove={(e) => e.stopPropagation()}
                        >
                          <Slider
                            min={0}
                            max={10000000}
                            step={100000}
                            value={tempPriceRange}
                            onValueChange={setTempPriceRange}
                            onValueCommit={setPriceRange}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0</span>
                          <span>10M+</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <Label className="mb-2 block">Amenities</Label>
                        <div className="space-y-2 grid grid-cols-2 max-h-60 overflow-y-auto border rounded-md p-2">
                          {amenities?.map((amenity) => (
                            <div
                              key={amenity.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={amenity.id}
                                checked={selectedAmenities.includes(amenity.id)}
                                onCheckedChange={() =>
                                  toggleAmenity(amenity.id)
                                }
                              />
                              <label
                                htmlFor={amenity.id}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {amenity.name}
                              </label>
                            </div>
                          ))}
                        </div>

                        {selectedAmenities.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedAmenities.length} selected
                          </p>
                        )}
                      </div>

                      {/* Clear Filters */}
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={clearAllFilters}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      )}
                    </div>

                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button className="w-full bg-brand hover:text-white hover:bg-black">
                          Close
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Search: {search}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearch("")}
                    />
                  </div>
                )}
                {propertyType !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Type:{" "}
                    {propertyTypes.find((t) => t.id === propertyType)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPropertyType("all")}
                    />
                  </div>
                )}
                {category !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Status: {categories.find((c) => c.id === category)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setCategory("all")}
                    />
                  </div>
                )}
                {community !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Community:{" "}
                    {communities.find((c) => c.id === community)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setCommunity("all")}
                    />
                  </div>
                )}
                {developer !== "all" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Developer:{" "}
                    {developers.find((d) => d.id === developer)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setDeveloper("all")}
                    />
                  </div>
                )}
                {beds !== "any" && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Beds: {beds}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setBeds("any")}
                    />
                  </div>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Price: {formatPrice(priceRange[0])} -{" "}
                    {formatPrice(priceRange[1])}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setPriceRange([0, 10000000]);
                        setTempPriceRange([0, 10000000]);
                      }}
                    />
                  </div>
                )}
                {selectedAmenities.length > 0 && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Amenities: {selectedAmenities.length}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedAmenities([])}
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Sort + View Mode */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing <strong>{properties.length}</strong> of{" "}
                    <strong>{total}</strong> properties
                  </>
                )}
              </p>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select
                  value={
                    sortBy === "isFeatured"
                      ? "featured"
                      : sortBy === "starting_price" && sortDir === "asc"
                      ? "price-low"
                      : sortBy === "starting_price" && sortDir === "desc"
                      ? "price-high"
                      : "newest"
                  }
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low → High</SelectItem>
                    <SelectItem value="price-high">
                      Price: High → Low
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Modes */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 />
                  </Button>

                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List />
                  </Button>

                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("map")}
                  >
                    <Map />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Grid */}
        <section className="py-4 px-4  md:px-28">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No properties found.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : viewMode === "map" ? (
              <MapView properties={properties} />
            ) : (
              <AnimatedPropertyGrid
                properties={properties}
                viewMode={viewMode}
              />
            )}
          </div>

          {/* Pagination */}
          {!loading && properties.length > 0 && (
            <div className="flex justify-center items-center gap-4 py-6">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PropertiesPage;
