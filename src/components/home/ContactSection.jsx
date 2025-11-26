"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, MapPin, Phone, Mail } from "lucide-react";

const BRAND_COLORS = {
  gradient1: "from-blue-600 to-cyan-400",
  gradient2: "from-pink-500 to-purple-600",
  gradient3: "from-green-500 to-teal-400",
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-400",
  border: "border-gray-200",
  shadow: "shadow-lg",
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // propertyType: "buy",
    location: "",
    budget: "",
    bedrooms: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/property-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Inquiry sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          // propertyType: "buy",
          location: "",
          budget: "",
          bedrooms: "",
          message: "",
        });
      } else {
        alert(data.error || "Failed to send inquiry.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <section className="text-center pt-12 px-6 sm:px-12 lg:px-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 bg-gradient-to-r ${BRAND_COLORS.gradient1} text-white`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-bold uppercase text-sm">Property Inquiry</span>
          </div>
          <h1 className={`text-5xl sm:text-6xl font-black mb-4 ${BRAND_COLORS.textGradient}`}>Find Your Dream Property</h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Whether you want to buy or rent, fill out the form and our team will help you find the perfect property.
          </p>
        </motion.div>
      </section>

      {/* Property Inquiry Form */}
      <section className="py-16 px-6 mx-auto max-w-3xl sm:px-12 lg:px-24 ">
        <div  >
          <Card className={`border-2 ${BRAND_COLORS.border} ${BRAND_COLORS.shadow}`}>
            <CardContent className="p-12">
              <h2 className={`text-3xl font-bold mb-6 ${BRAND_COLORS.textGradient} text-center`}>Property Inquiry Form</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                {/* Contact */}
                <Input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                {/* Property Type */}
                

                {/* Property Details */}
                {/* <Input
                  placeholder="Location *"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <Input
                  placeholder="Budget (USD) *"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
                <Input
                  placeholder="Bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                /> */}

                {/* Message */}
                <Textarea
                  placeholder="Additional Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full py-4 text-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Inquiry"} <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;
