"use client";

import React, { useEffect, useState } from "react";
import { usePropertyStore } from "@/store/propertyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Bed, Bath, Square, Building2, Calendar, TrendingUp, DollarSign, FileText, Navigation, Clock, Award, CheckCircle2, Download } from "lucide-react";
import Carousel from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use } from "react";
import { toast } from "sonner";
import PropertyGallery from "@/components/property/PropertyGallery";

const PropertyDetail = ({ params }) => {
  const { fetchPropertyById, loading } = usePropertyStore();

  const [property, setProperty] = useState(null);
  const [propertyImages, setPropertyImages] = useState([
    { url: "/assets/property-placeholder.jpg", alt: "Loading..." },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  
  });

  const resolvedParams = use(params);
  const { id } = resolvedParams;

  useEffect(() => {
    const loadProperty = async () => {
      const data = await fetchPropertyById(id);
      if (data) {
        const flatProperty = {
          ...data,
          developer: data.developers?.name || "Unknown Developer",
          developerLogo: data.developers?.logo_url || null,
          community: data.communities?.name || "Unknown Community",
          type: data.property_types?.name || "Unknown Type",
          status: data.property_status_types?.name || "Unknown Status",
          amenities: data.property_amenities?.map((a) => a.amenity.name) || [],
          features: data.property_features?.map((f) => f.feature.name) || [],
          views: data.property_views?.map((v) => v.view.name) || [],
          documents: data.property_documents || [],
          nearbyPoints: data.property_nearby_points || [],
          floorPlans: data.floor_plans || [],
          paymentPlans: data.payment_plans || [],
          media: data.property_media || [],
          constructionUpdates: data.construction_updates || [],
        };

        setProperty(flatProperty);

        const images =
          data.property_images?.length > 0
            ? data.property_images.map((img, index) => ({
                url: img.image_url,
                alt: data.title || `Property image ${index + 1}`,
              }))
            : [{ url: "/assets/property-placeholder.jpg", alt: "No Image" }];

        setPropertyImages(images);
      }
    };
    loadProperty();
  }, [id, fetchPropertyById]);

 const handleSubmit = async () => {
  try {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Missing required fields");
      return;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        property_id: property?.id || null, // pass from page params
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed");

    toast.success("Message saved");
  } catch (err) {
    console.error("Frontend submit error:", err.message);
  }
};


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  const keyStats = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Square, label: "Size Range", value: `${property.size_range} sq ft` },
    { icon: Building2, label: "Type", value: property.type },
  ];

  const financialDetails = [
    { icon: DollarSign, label: "Price Range", value: property.price_range ? `AED ${property.price_range}` : null },
    { icon: TrendingUp, label: "ROI", value: property.roi ? `${property.roi}%` : null },
    { icon: FileText, label: "Service Charge", value: property.service_charge ? `${property.service_charge}%` : null },
    { icon: DollarSign, label: "Annual Rent", value: property.annual_rent ? `AED ${property.annual_rent.toLocaleString()}` : null },
    { icon: TrendingUp, label: "Estimated Yield", value: property.estimated_yield ? `${property.estimated_yield}%` : null },
    { icon: Square, label: "Market Price PSF", value: property.market_price_psf ? `AED ${property.market_price_psf}` : null },
    { icon: Square, label: "Rental Price PSF", value: property.rental_price_psf ? `AED ${property.rental_price_psf}` : null },
  ].filter(item => item.value);

  const nearbyByCategory = property.nearbyPoints.reduce((acc, point) => {
    const category = point.nearby_categories?.name || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(point);
    return acc;
  }, {});

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
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
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
              {(property.amenities.length > 0 || property.features.length > 0 || property.views.length > 0) && (
                <Card className="p-6">
                  <Tabs defaultValue="amenities" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {property.amenities.length > 0 && <TabsTrigger value="amenities">Amenities</TabsTrigger>}
                      {property.features.length > 0 && <TabsTrigger value="features">Features</TabsTrigger>}
                      {property.views.length > 0 && <TabsTrigger value="views">Views</TabsTrigger>}
                    </TabsList>
                    {property.amenities.length > 0 && (
                      <TabsContent value="amenities" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    {property.features.length > 0 && (
                      <TabsContent value="features" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                    {property.views.length > 0 && (
                      <TabsContent value="views" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.views.map((view, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                              <span className="text-muted-foreground">{view}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </Card>
              )}

              {/* Nearby Points */}
              {property.nearbyPoints.length > 0 && (
                <Card className="p-6">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-4">Nearby Locations</h2>
                  <div className="space-y-4">
                    {Object.entries(nearbyByCategory).map(([category, points]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-2 text-primary/80">{category}</h3>
                        <div className="space-y-2">
                          {points.map((point) => (
                            <div key={point.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Navigation className="h-4 w-4 text-accent" />
                                <span className="text-muted-foreground">{point.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                {point.distance_in_km && (
                                  <span className="text-muted-foreground">{point.distance_in_km} km</span>
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
              {property.documents.length > 0 && (
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
                          <p className="font-medium text-foreground">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.document_types?.name}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}

               {/* Developer Info Card */}
              <Card className="p-6 mt-4  bottom-10">
                <h3 className="font-semibold text-lg mb-3">Developer</h3>
                {property.developerLogo && (
                  <img src={property.developerLogo} alt={property.developer} className="h-12 mb-3" />
                )}
                <p className="font-medium text-primary">{property.developer}</p>
              </Card>
            </div>

            {/* Contact Form Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-24">
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

             
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;