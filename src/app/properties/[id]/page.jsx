"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Square, Building2, Calendar, TrendingUp, DollarSign, FileText, Navigation, Clock, Award, CheckCircle2, Download, Hammer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use } from "react";
import { toast } from "sonner";
import PropertyGallery from "@/components/property/PropertyGallery";
import AnimatedPropertyGrid from "@/components/AnimatedPropertyGrid";

// Helper function to flatten property data (moved outside component)
const flattenPropertyData = (data) => {
  const amenityNames = data.property_amenities?.map((item) => 
    item.amenity?.name || item.name || null
  ).filter(Boolean) || [];

  const featureNames = data.property_features?.map((item) => 
    item.feature?.name || item.name || null
  ).filter(Boolean) || [];

  const viewNames = data.property_views?.map((item) => 
    item.view?.name || item.name || null
  ).filter(Boolean) || [];

  return {
    ...data,
    developer: data.developers?.name || "Unknown Developer",
    developerLogo: data.developers?.logo_url || null,
    community: data.communities?.name || "Unknown Community",
    type: data.property_types?.name || "Unknown Type",
    status: data.property_status_types?.name || "Unknown Status",
    amenities: amenityNames,
    features: featureNames,
    views: viewNames,
    documents: data.property_documents || [],
    nearbyPoints: data.property_nearby_points || [],
    floorPlans: data.floor_plans || [],
    paymentPlans: data.payment_plans || [],
    media: data.property_media || [],
    constructionUpdates: data.construction_updates || [],
  };
};

// Calculate similar properties score (moved outside component)
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

const PropertyDetail = ({ params }) => {
  const { fetchPropertyById, fetchProperties, loading } = usePropertyStore();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // Memoize property images to prevent recalculation
  const propertyImages = useMemo(() => {
    if (!property) {
      return [{ url: "/assets/property-placeholder.jpg", alt: "Loading..." }];
    }
    
    return property.property_images?.length > 0
      ? property.property_images.map((img, index) => ({
          url: img.image_url,
          alt: property.title || `Property image ${index + 1}`,
        }))
      : [{ url: "/assets/property-placeholder.jpg", alt: "No Image" }];
  }, [property?.property_images, property?.title]);

  // Memoize key stats to prevent recalculation
  const keyStats = useMemo(() => [
    { icon: Bed, label: "Bedrooms", value: property?.bedrooms || "N/A" },
    { icon: Bath, label: "Bathrooms", value: property?.bathrooms || "N/A" },
    { icon: Square, label: "Size Range", value: property?.size_range ? `${property.size_range} sq ft` : "N/A" },
    { icon: Building2, label: "Type", value: property?.type || "N/A" },
  ], [property?.bedrooms, property?.bathrooms, property?.size_range, property?.type]);

  // Memoize financial details
  const financialDetails = useMemo(() => {
    if (!property) return [];
    
    return [
      { icon: DollarSign, label: "Price Range", value: property.price_range ? `AED ${property.price_range}` : null },
      { icon: TrendingUp, label: "ROI", value: property.roi ? `${property.roi}%` : null },
      { icon: FileText, label: "Service Charge", value: property.service_charge ? `${property.service_charge}%` : null },
      { icon: DollarSign, label: "Annual Rent", value: property.annual_rent ? `AED ${property.annual_rent.toLocaleString()}` : null },
      { icon: TrendingUp, label: "Estimated Yield", value: property.estimated_yield ? `${property.estimated_yield}%` : null },
      { icon: Square, label: "Market Price PSF", value: property.market_price_psf ? `AED ${property.market_price_psf}` : null },
      { icon: Square, label: "Rental Price PSF", value: property.rental_price_psf ? `AED ${property.rental_price_psf}` : null },
    ].filter(item => item.value);
  }, [property]);

  // Memoize nearby points by category
  const nearbyByCategory = useMemo(() => {
    if (!property?.nearbyPoints) return {};
    
    return property.nearbyPoints.reduce((acc, point) => {
      const category = point.nearby_categories?.name || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(point);
      return acc;
    }, {});
  }, [property?.nearbyPoints]);

  // Memoize tab visibility flags
  const tabFlags = useMemo(() => ({
    hasAmenities: property?.property_amenities?.length > 0,
    hasFeatures: property?.property_features?.length > 0,
    hasViews: property?.property_views?.length > 0,
  }), [property?.property_amenities, property?.property_features, property?.property_views]);

  const showTabs = tabFlags.hasAmenities || tabFlags.hasFeatures || tabFlags.hasViews;

  // Memoize default tab value
  const defaultTab = useMemo(() => {
    if (tabFlags.hasAmenities) return "amenities";
    if (tabFlags.hasFeatures) return "features";
    return "views";
  }, [tabFlags]);

  // Load similar properties (memoized with useCallback)
  const loadSimilarProperties = useCallback(async (currentProperty) => {
    try {
      const allProperties = await fetchProperties();
      
      if (!allProperties?.length) {
        console.log("No properties available for similar properties");
        return;
      }

      const scored = allProperties
        .filter(p => p.id !== currentProperty.id)
        .map(p => ({ property: p, score: calculateSimilarityScore(p, currentProperty) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(item => item.property);

      setSimilarProperties(scored);
    } catch (error) {
      console.error("Error loading similar properties:", error);
    }
  }, [fetchProperties]);

  // Main property load effect
  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      const data = await fetchPropertyById(id);
      
      if (!isMounted) return;
      
      if (data) {
        const flatProperty = flattenPropertyData(data);
        setProperty(flatProperty);
        
        // Load similar properties in parallel (don't wait)
        loadSimilarProperties(data);
      }
    };
    
    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id, fetchPropertyById, loadSimilarProperties]);

  // Handle form input changes (memoized)
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle form submission (memoized)
  const handleSubmit = useCallback(async () => {
    try {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Missing required fields");
        return;
      }

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

      toast.success("Message sent successfully!");
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error("Frontend submit error:", err.message);
      toast.error("Failed to send message");
    }
  }, [formData, property?.id]);

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span>/</span>
              <a href="/properties" className="hover:text-foreground transition-colors">Properties</a>
              <span>/</span>
              <span className="text-foreground">{property.title}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-gold py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {property.isFeatured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      <Award className="h-3 w-3" />
                      FEATURED
                    </span>
                  )}
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                    {property.status}
                  </span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-primary/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{property.community}</span>
                  </div>
                  {property.developerLogo ? (
                    <img src={property.developerLogo} alt={property.developer} className="h-8" />
                  ) : (
                    <span className="text-sm">by {property.developer}</span>
                  )}
                </div>
                {property.handover && (
                  <div className="flex items-center gap-2 mt-3 text-primary/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Handover: {property.handover}</span>
                  </div>
                )}
              </div>
              <div className="text-left md:text-right bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                <p className="text-primary/80 text-sm mb-1">Starting from</p>
                <p className="text-5xl font-bold text-primary mb-2">
                  AED {property.starting_price?.toLocaleString() || "N/A"}
                </p>
                {property.price_range && (
                  <p className="text-sm text-primary/70">Range: AED {property.price_range}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Key Stats Bar */}
        <section className="bg-muted/50 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {keyStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="bg-background py-8">
          <PropertyGallery propertyImages={propertyImages}/>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {property.description && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">About This Property</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
                </Card>
              )}

              {/* Financial Details */}
              {financialDetails.length > 0 && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Investment Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {financialDetails.map((detail, index) => {
                      const Icon = detail.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Icon className="h-5 w-5 text-accent flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{detail.label}</p>
                            <p className="font-semibold">{detail.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Tabs for Amenities, Features, Views */}
              {showTabs && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Property Highlights</h2>
                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {tabFlags.hasAmenities && <TabsTrigger value="amenities">Amenities ({property.property_amenities.length})</TabsTrigger>}
                      {tabFlags.hasFeatures && <TabsTrigger value="features">Features ({property.property_features.length})</TabsTrigger>}
                      {tabFlags.hasViews && <TabsTrigger value="views">Views ({property.property_views.length})</TabsTrigger>}
                    </TabsList>
                    
                    {tabFlags.hasAmenities && (
                      <TabsContent value="amenities" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.property_amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 transition-colors">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{amenity.amenities?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    
                    {tabFlags.hasFeatures && (
                      <TabsContent value="features" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.property_features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 transition-colors">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{feature.features?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    
                    {tabFlags.hasViews && (
                      <TabsContent value="views" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.property_views.map((view, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 transition-colors">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{view.view_types?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </Card>
              )}

              {/* Construction Updates */}
              {property.constructionUpdates?.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Hammer className="h-6 w-6 text-accent" />
                    <h2 className="font-serif text-2xl font-bold text-primary">Construction Progress</h2>
                  </div>
                  <div className="space-y-4">
                    {property.constructionUpdates.map((update) => (
                      <div key={update.id} className="border-l-4 border-accent pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {update.update_date ? new Date(update.update_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Date not specified'}
                          </span>
                          {update.progress_percent !== null && (
                            <span className="text-sm font-semibold text-accent">
                              {update.progress_percent}% Complete
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{update.update_text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Floor Plans */}
              {property.floorPlans?.length > 0 && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Floor Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.floorPlans.map((plan) => (
                      <a
                        key={plan.id}
                        href={plan.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                          <FileText className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{plan.size} sqft</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Nearby Points */}
              {Object.keys(nearbyByCategory).length > 0 && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Nearby Locations</h2>
                  <div className="space-y-4">
                    {Object.entries(nearbyByCategory).map(([category, points]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-2 text-primary/80">{category}</h3>
                        <div className="space-y-2">
                          {points.map((point) => (
                            <div key={point.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
                              <div className="flex items-center gap-3">
                                <Navigation className="h-4 w-4 text-accent" />
                                <span className="text-muted-foreground">{point.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                {point.distance_in_km && (
                                  <span className="text-muted-foreground font-medium">{point.distance_in_km} km</span>
                                )}
                                {point.distance_in_minutes && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-muted-foreground">{point.distance_in_minutes} min</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Documents */}
              {property.documents?.length > 0 && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Documents & Brochures</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                          <Download className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc.document_types?.name || 'Document'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Developer Info Card - Mobile */}
              <Card className="p-6 lg:hidden">
                <h3 className="font-semibold text-lg mb-3">Developer</h3>
                {property.developerLogo && (
                  <img src={property.developerLogo} alt={property.developer} className="h-12 mb-3" />
                )}
                <p className="font-medium text-primary">{property.developer}</p>
              </Card>
            </div>

            {/* Contact Form Sidebar */}
            <div className="space-y-6 sticky top-24">
              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-2">Interested in this property?</h3>
                <p className="text-sm text-muted-foreground mb-6">Fill out the form and we'll get back to you shortly.</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Your full name" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+971 XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your requirements..." 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                 
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-brand" 
                    variant="hero" 
                    size="lg"
                  >
                    Request Information
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to our terms and privacy policy
                  </p>
                </div>
              </Card>

              {/* Developer Info Card - Desktop */}
              <Card className="p-6 hidden lg:block">
                <h3 className="font-semibold text-lg mb-3">Developer</h3>
                {property.developerLogo && (
                  <img src={property.developerLogo} alt={property.developer} className="h-12 mb-3" />
                )}
                <p className="font-medium text-primary">{property.developer}</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <section className="bg-muted/30 py-16 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
                  Similar Properties
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Explore other properties that match your interests
                </p>
              </div>
              <AnimatedPropertyGrid properties={similarProperties} viewMode="grid" />
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/properties'}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  View All Properties
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PropertyDetail;