"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, Bed, Bath, Square, Building2, Calendar, TrendingUp, 
  DollarSign, FileText, Navigation, Clock, Award, CheckCircle2, 
  Download, Hammer, ChevronRight, Phone, Mail, MessageSquare,
  Eye, Share2, Heart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use } from "react";
import { toast } from "sonner";
import PropertyGallery from "@/components/property/PropertyGallery";
import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";

// Loading skeleton components
const StatSkeleton = () => (
  <div className="flex items-center gap-3 animate-pulse">
    <div className="p-2 bg-muted rounded-lg w-10 h-10" />
    <div className="flex-1">
      <div className="h-3 bg-muted rounded w-16 mb-2" />
      <div className="h-4 bg-muted rounded w-20" />
    </div>
  </div>
);

const CardSkeleton = () => (
  <Card className="p-6 animate-pulse">
    <div className="h-6 bg-muted rounded w-1/3 mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-4 bg-muted rounded w-4/6" />
    </div>
  </Card>
);

// Optimized helper functions
const flattenPropertyData = (data) => {
  return {
    ...data,
    developer: data.developers?.name || "Unknown Developer",
    developerLogo: data.developers?.logo_url || null,
    community: data.communities?.name || "Unknown Community",
    type: data.property_types?.name || "Unknown Type",
    status: data.property_status_types?.name || "Unknown Status",
    amenities: data.property_amenities?.map(item => item.amenities?.name).filter(Boolean) || [],
    features: data.property_features?.map(item => item.features?.name).filter(Boolean) || [],
    views: data.property_views?.map(item => item.view_types?.name).filter(Boolean) || [],
    documents: data.property_documents || [],
    nearbyPoints: data.property_nearby_points || [],
    floorPlans: data.floor_plans || [],
    paymentPlans: data.payment_plans || [],
    media: data.property_media || [],
    constructionUpdates: data.construction_updates || [],
  };
};

const calculateSimilarityScore = (p, currentProperty) => {
  let score = 0;
  if (p.property_type_id === currentProperty.property_type_id) score += 5;
  if (p.community_id === currentProperty.community_id) score += 4;
  if (p.starting_price && currentProperty.starting_price) {
    const priceDiff = Math.abs(p.starting_price - currentProperty.starting_price);
    const priceRange = currentProperty.starting_price * 0.3;
    if (priceDiff <= priceRange) score += 3;
  }
  if (p.developer_id === currentProperty.developer_id) score += 2;
  if (p.bedrooms === currentProperty.bedrooms) score += 1;
  return score;
};

// Quick Action Bar Component
const QuickActions = ({ onShare, onSave }) => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
    {/* <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
      <Heart className="h-4 w-4" />
      Save
    </Button> */}
  </div>
);

// Compact Stat Card
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-accent transition-colors">
    <div className="p-2 bg-accent/10 rounded-lg">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  </div>
);

// Compact Info Section
const InfoSection = ({ title, icon: Icon, children }) => (
  <Card className="p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-accent" />
      <h3 className="font-semibold text-lg text-primary">{title}</h3>
    </div>
    {children}
  </Card>
);

const PropertyDetail = ({ params }) => {
  const { fetchPropertyById, fetchProperties, loading } = usePropertyStore();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // Memoized computed values
  const propertyImages = useMemo(() => {
    if (!property?.property_images?.length) {
      return [{ url: "/assets/property-placeholder.jpg", alt: "Loading..." }];
    }
    return property.property_images.map((img, index) => ({
      url: img.image_url,
      alt: property.title || `Property image ${index + 1}`,
    }));
  }, [property?.property_images, property?.title]);

  const keyStats = useMemo(() => {
    if (!property) return [];
    return [
      { icon: Bed, label: "Bedrooms", value: property.bedrooms || "N/A" },
      { icon: Bath, label: "Bathrooms", value: property.bathrooms || "N/A" },
      { icon: Square, label: "Size", value: property.size_range ? `${property.size_range} sq ft` : "N/A" },
      { icon: Building2, label: "Type", value: property.type || "N/A" },
    ];
  }, [property]);

  const financialDetails = useMemo(() => {
    if (!property) return [];
    return [
      { icon: DollarSign, label: "Price Range", value: property.price_range ? `AED ${property.price_range}` : null },
      { icon: TrendingUp, label: "ROI", value: property.roi ? `${property.roi}%` : null },
      { icon: DollarSign, label: "Annual Rent", value: property.annual_rent ? `AED ${property.annual_rent.toLocaleString()}` : null },
      { icon: TrendingUp, label: "Est. Yield", value: property.estimated_yield ? `${property.estimated_yield}%` : null },
    ].filter(item => item.value);
  }, [property]);

  const nearbyByCategory = useMemo(() => {
    if (!property?.nearbyPoints) return {};
    return property.nearbyPoints.reduce((acc, point) => {
      const category = point.nearby_categories?.name || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(point);
      return acc;
    }, {});
  }, [property?.nearbyPoints]);

  const hasHighlights = useMemo(() => {
    return property?.property_amenities?.length > 0 || 
           property?.property_features?.length > 0 || 
           property?.property_views?.length > 0;
  }, [property]);

  // Load property data
  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      const data = await fetchPropertyById(id);
      if (!isMounted) return;
      
      if (data) {
        const flatProperty = flattenPropertyData(data);
        setProperty(flatProperty);
      }
    };
    
    loadProperty();
    return () => { isMounted = false; };
  }, [id, fetchPropertyById]);

  // Load similar properties separately
  useEffect(() => {
    if (!property) return;
    
    let isMounted = true;
    const loadSimilar = async () => {
      try {
        const allProperties = await fetchProperties();
        if (!isMounted || !allProperties?.length) return;

        const scored = allProperties
          .filter(p => p.id !== property.id)
          .map(p => ({ property: p, score: calculateSimilarityScore(p, property) }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(item => item.property);

        setSimilarProperties(scored);
      } catch (error) {
        console.error("Error loading similar properties:", error);
      }
    };

    loadSimilar();
    return () => { isMounted = false; };
  }, [property, fetchProperties]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success("Message sent successfully! We'll contact you soon.");
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error("Submit error:", err.message);
      toast.error("Failed to send message. Please try again.");
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

  const handleSave = useCallback(() => {
    toast.success("Property saved to your favorites!");
  }, []);

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-muted rounded-lg animate-pulse" />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div>
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="">
        {/* Compact Hero Section */}
        <section className="bg-linear-to-br from-primary/5 via-accent/5 to-background border-b border-border">
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
        <section className="bg-background py-6">
          <Suspense fallback={<div className="aspect-video bg-muted animate-pulse " />}>
            <PropertyGallery propertyImages={propertyImages} />
          </Suspense>
        </section>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {property.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      <Award className="h-3 w-3" />
                      FEATURED
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                    {property.status}
                  </span>
                </div>
                
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2 leading-tight">
                  {property.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{property.community}</span>
                  </div>
                  {property.handover && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Handover: {property.handover}</span>
                    </div>
                  )}
                </div>

                {property.developerLogo && (
                  <img src={property.developerLogo} alt={property.developer} className="h-8 opacity-80" />
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right bg-card border border-border rounded-lg p-4 min-w-50">
                  <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-primary">
                    AED {property.starting_price?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <QuickActions onShare={handleShare} onSave={handleSave} />
              </div>
            </div>
          </div>
        </section>

        {/* Compact Stats Bar */}
        <section className=" py-3 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

              {/* Highlights Tabs */}
              {hasHighlights && (
                <InfoSection title="Property Highlights" icon={CheckCircle2}>
                  <Tabs defaultValue="amenities" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {property.property_amenities?.length > 0 && (
                        <TabsTrigger value="amenities">Amenities</TabsTrigger>
                      )}
                      {property.property_features?.length > 0 && (
                        <TabsTrigger value="features">Features</TabsTrigger>
                      )}
                      {property.property_views?.length > 0 && (
                        <TabsTrigger value="views">Views</TabsTrigger>
                      )}
                    </TabsList>
                    
                    {property.property_amenities?.length > 0 && (
                      <TabsContent value="amenities" className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {property.property_amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
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
                              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
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
                              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                              <span className="text-muted-foreground">{view.view_types?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </InfoSection>
              )}

              {/* Nearby Locations - Compact */}
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
                              <div className="flex items-center gap-2">
                                {point.distance_in_km && (
                                  <span className="text-xs font-medium">{point.distance_in_km} km</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <Card className="p-5 ">
                <h3 className="font-semibold text-lg text-primary mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
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
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-light mt-2" 
                    size="lg"
                  >
                    {isSubmitting ? "Sending..." : "Request Information"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    We'll respond within 24 hours
                  </p>
                </div>
              </Card>

              {/* Developer Card */}
              <Card className="p-5 ">
                <h4 className="font-medium text-sm mb-3">Developer</h4>
                {property.developerLogo && (
                  <img src={property.developerLogo} alt={property.developer} className="h-10 mb-2" />
                )}
                <p className="font-medium text-primary">{property.developer}</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="bg-muted/20 py-12 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-6">
                Similar Properties
              </h2>
              <Suspense fallback={<div>Loading...</div>}>
                <AnimatedPropertyGrid properties={similarProperties} viewMode="grid" />
              </Suspense>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PropertyDetail;