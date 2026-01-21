'use client'

import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-primary/90 py-2 text-white">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                {/* <h3 className="text-2xl font-bold text-white mb-2">Dubai Dreams Properties</h3> */}
                 <img className="w-24 h-24" src="/assets/logo.png" alt="" />

                <p className="text-secondary leading-relaxed">
                 Focused on Dubai’s most profitable off-plan projects—secure premium units at launch prices and maximize your ROI with expert guidance.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-secondary" />
                  <span>info@dubaidreams.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <span>+971 50 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <span>Downtown Dubai, Dubai, UAE</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#properties" className="hover:text-white transition-colors">Properties</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                {/* <li><a href="#agents" className="hover:text-white transition-colors">Our Agents</a></li> */}
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Services</h4>
              <ul className="space-y-3">
                {/* <li><a href="#buy" className="hover:text-white transition-colors">Buy Property</a></li> */}
                {/* <li><a href="#sell" className="hover:text-white transition-colors">Sell Property</a></li> */}
                <li><a href="/properties" className="hover:text-white transition-colors">View Properties</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Property Consulting</a></li>
                <li><a href="#legal" className="hover:text-white transition-colors">Legal & Documentation</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-secondary mb-4 md:mb-0">
              © 2025 Dubai Dreams Properties. All rights reserved.
            </div>

            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-primary/10 text-white hover:bg-primary/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-white hover:bg-primary/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-white hover:bg-primary/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-white hover:bg-primary/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
