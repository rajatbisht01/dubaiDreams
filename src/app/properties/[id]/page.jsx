"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, Bed, Square, Building2, Calendar, TrendingUp, 
  DollarSign, FileText, CheckCircle2, Navigation,
  Download, Hammer, ChevronRight, Star, Eye, Award, Share2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PropertyDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-muted rounded-lg animate-pulse" />
          <Card className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-2/3 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
    <div className="p-2 bg-accent/10 rounded-lg">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  </div>
);

const InfoSection = ({ title, icon: Icon, children }) => (
  <Card className="p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-accent" />
      <h3 className="font-semibold text-lg text-primary">{title}</h3>
    </div>
    {children}
  </Card>
);

const QuickActions = ({ onShare }) => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  </div>
);

// Image Gallery Component
const PropertyGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="aspect-video bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img 
          src={images[currentIndex].url} 
          alt={images[currentIndex].alt}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyDetail = ({ params }) => {
  const properties = usePropertyStore(state => state.properties) || [];
  const fetchPropertyById = usePropertyStore(state => state.fetchPropertyById);
  const currency = usePropertyStore(state => state.currency); // Add currency to trigger re-render
  const formatPrice = usePropertyStore(state => state.formatPrice);
  const formatPriceRange = usePropertyStore(state => state.formatPriceRange);
  
  const [property, setProperty] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', message: '',
  });

  // Unwrap params with React.use()
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  // Load property - check store first, then fetch if needed
  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      // First, try to find in store (from property list)
      const cached = properties.find(p => p.id === id);
      
      if (cached) {
        console.log("✅ Using cached property from store");
        if (isMounted) {
          setProperty(cached);
          setLoading(false);
        }
      } else {
        console.log("📡 Property not in store, fetching...");
        // If not in store, fetch it
        try {
          const data = await fetchPropertyById(id);
          if (data && isMounted) {
            setProperty(data);
          }
        } catch (error) {
          console.error("Error fetching property:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]); // Only depend on id

  // Fetch only additional data (documents, floor plans, construction updates)
  useEffect(() => {
    if (!property) return;

    let isMounted = true;

    const fetchAdditionalData = async () => {
      try {
        console.log("📄 Fetching additional details...");
        const res = await fetch(`/api/properties/${id}/details`);
        if (res.ok && isMounted) {
          const data = await res.json();
          console.log("✅ Additional details loaded:", data);
          setAdditionalData(data);
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };

    // Only fetch if we don't have this data already
    const needsAdditionalData = 
      !property.property_documents?.length || 
      !property.floor_plans?.length || 
      !property.construction_updates?.length;
      
    if (needsAdditionalData) {
      fetchAdditionalData();
    }

    return () => {
      isMounted = false;
    };
  }, [property?.id]); // Only depend on property.id

  const propertyImages = useMemo(() => {
    if (!property?.property_images?.length) {
      return [{ url: "/assets/property-placeholder.jpg", alt: "Loading..." }];
    }
    return property.property_images.map((img) => ({
      url: img.image_url,
      alt: property.title,
    }));
  }, [property?.property_images, property?.title]);

  const keyStats = useMemo(() => {
    if (!property) return [];
    
    const formatBedrooms = (beds) => {
      if (!beds) return "N/A";
      const bedsStr = beds.toString().trim();
      if (bedsStr.includes(',') || bedsStr.includes('&')) {
        return bedsStr.replace(/\s/g, '').replace(/,/g, '-').replace(/&/g, '-');
      }
      return bedsStr;
    };

    return [
      { icon: Bed, label: "Bedrooms", value: formatBedrooms(property.bedrooms) },
      { icon: Square, label: "Size", value: property.size_range ? `${property.size_range} sq ft` : "N/A" },
      { icon: Building2, label: "Type", value: property.property_types?.name || "N/A" },
    ];
  }, [property]);

  const financialDetails = useMemo(() => {
    if (!property) return [];
    
    return [
      { 
        icon: DollarSign, 
        label: "Price Range", 
        value: property.price_range ? formatPriceRange(property.price_range) : null
      },
      { 
        icon: TrendingUp, 
        label: "ROI", 
        value: property.roi ? `${property.roi}%` : null 
      },
      { 
        icon: TrendingUp, 
        label: "Est. Yield", 
        value: property.estimated_yield ? `${property.estimated_yield}%` : null 
      },
    ].filter(item => item.value);
  }, [property, formatPriceRange, currency]); // Add currency dependency

  const nearbyByCategory = useMemo(() => {
    if (!property?.property_nearby_points) return {};
    return property.property_nearby_points.reduce((acc, point) => {
      const category = point.nearby_categories?.name || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(point);
      return acc;
    }, {});
  }, [property?.property_nearby_points]);

  // Memoize formatted price so it updates with currency changes
  const formattedStartingPrice = useMemo(() => {
    return formatPrice(property?.starting_price);
  }, [property?.starting_price, formatPrice, currency]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: property?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        })
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Message sent successfully!");
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, property?.id]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out ${property?.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }, [property?.title]);

  if (loading || !property) {
    return <PropertyDetailSkeleton />;
  }

  // Merge additional data with property data
  const documents = additionalData?.property_documents || property.property_documents || [];
  const floorPlans = additionalData?.floor_plans || property.floor_plans || [];
  const constructionUpdates = additionalData?.construction_updates || property.construction_updates || [];
console.log("property details page render: ",property);
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <ChevronRight className="h-4 w-4" />
              <a href="/properties" className="hover:text-foreground transition-colors">Properties</a>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate">{property.title}</span>
            </div>
            
            {/* Image Gallery */}
            <PropertyGallery images={propertyImages} />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mt-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {property.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      <Star className="h-3 w-3" />
                      FEATURED
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                    {property.property_status_types?.name || "Off-Plan"}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 leading-tight">
                  {property.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                  {property.communities?.name && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.communities.name}</span>
                    </div>
                  )}
                  {property.estimated_yield && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Est. Yield: {property.estimated_yield}%</span>
                    </div>
                  )}
                </div>

                {property.developers?.logo_url && (
                  <img src={property.developers.logo_url} alt={property.developers.name} className="h-8 opacity-80" />
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-primary">
                    {formattedStartingPrice}
                  </p>
                </div>
                <QuickActions onShare={handleShare} />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-3 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {keyStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {property.description && (
                <InfoSection title="About This Property" icon={FileText}>
                  <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                    {property.description}
                  </p>
                </InfoSection>
              )}

              {/* Financial Details */}
              {financialDetails.length > 0 && (
                <InfoSection title="Investment Details" icon={TrendingUp}>
                  <div className="grid grid-cols-2 gap-3">
                    {financialDetails.map((detail, index) => {
                      const Icon = detail.icon;
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <Icon className="h-4 w-4 text-accent shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{detail.label}</p>
                            <p className="font-semibold text-sm">{detail.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </InfoSection>
              )}

              {/* Construction Updates */}
              {constructionUpdates.length > 0 && (
                <InfoSection title="Construction Progress" icon={Hammer}>
                  <div className="space-y-4">
                    {constructionUpdates.map((update) => (
                      <div key={update.id} className="border-l-4 border-accent pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.update_date).toLocaleDateString()}
                          </span>
                          {update.progress_percent && (
                            <span className="text-sm font-semibold text-accent">
                              {update.progress_percent}% Complete
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">{update.update_text}</p>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              {/* Floor Plans */}
              {floorPlans.length > 0 && (
                <InfoSection title="Floor Plans" icon={FileText}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {floorPlans.map((plan) => (
                      <a
                        key={plan.id}
                        href={plan.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Download className="h-5 w-5 text-accent" />
                        <span className="font-medium text-sm">{plan.title}</span>
                      </a>
                    ))}
                  </div>
                </InfoSection>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <InfoSection title="Documents" icon={FileText}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Download className="h-5 w-5 text-accent" />
                        <span className="font-medium text-sm">{doc.title || doc.document_types?.name || 'Document'}</span>
                      </a>
                    ))}
                  </div>
                </InfoSection>
              )}

              {/* Property Highlights */}
              {(property.property_amenities?.length > 0 || property.property_features?.length > 0 || property.property_views?.length > 0) && (
                <InfoSection title="Property Highlights" icon={CheckCircle2}>
                  <Tabs defaultValue={property.property_amenities?.length > 0 ? "amenities" : property.property_features?.length > 0 ? "features" : "views"}>
                    <TabsList className="grid w-full grid-cols-3">
                      {property.property_amenities?.length > 0 && <TabsTrigger value="amenities">Amenities</TabsTrigger>}
                      {property.property_features?.length > 0 && <TabsTrigger value="features">Features</TabsTrigger>}
                      {property.property_views?.length > 0 && <TabsTrigger value="views">Views</TabsTrigger>}
                    </TabsList>
                    
                    {property.property_amenities?.length > 0 && (
                      <TabsContent value="amenities" className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {property.property_amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{amenity.amenities?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    
                    {property.property_features?.length > 0 && (
                      <TabsContent value="features" className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {property.property_features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{feature.features?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    
                    {property.property_views?.length > 0 && (
                      <TabsContent value="views" className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {property.property_views.map((view, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Eye className="h-4 w-4 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{view.view_types?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </InfoSection>
              )}

              {/* Nearby Locations */}
              {Object.keys(nearbyByCategory).length > 0 && (
                <InfoSection title="Nearby Locations" icon={Navigation}>
                  <div className="space-y-3">
                    {Object.entries(nearbyByCategory).map(([category, points]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm mb-2 text-primary/80">{category}</h4>
                        <div className="space-y-1">
                          {points.slice(0, 3).map((point) => (
                            <div key={point.id} className="flex items-center justify-between text-sm py-1">
                              <span className="text-muted-foreground">{point.name}</span>
                              {point.distance_in_km && (
                                <span className="text-xs font-medium">{point.distance_in_km} km</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-5 sticky top-4">
                <h3 className="font-semibold text-lg text-primary mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+971 XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="I'm interested in..." 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-hover mt-2"
                  >
                    {isSubmitting ? "Sending..." : "Request Information"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    We'll respond within 24 hours
                  </p>
                </div>
              </Card>

              {property.developers && (
                <Card className="p-5">
                  <h4 className="font-medium text-sm mb-3">Developer</h4>
                  {property.developers.logo_url && (
                    <img src={property.developers.logo_url} alt={property.developers.name} className="h-10 mb-2" />
                  )}
                  <p className="font-medium text-primary">{property.developers.name}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;