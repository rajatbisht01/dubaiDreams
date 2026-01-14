"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, Building2, Phone, Info, Menu, X, User } from "lucide-react";
import { useUser } from "@/hooks/useUser";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { profile, loading } = useUser();
  const role = profile?.role;

  const baseLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Off-Plans", icon: Building2 },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const adminLink = { href: "/admin", label: "Admin", icon: User };

  const navLinks =
    role === "admin" || role === "superAdmin"
      ? [...baseLinks, adminLink]
      : baseLinks;

  const isActive = (path) => pathname === path;

  if (loading) return null; // optional UX optimization

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="container w-screen mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
           <img src="/assets/logo.png" alt="logo"  className="w-24 h-24 p-2"/>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                  isActive(link.href)
                    ? "text-primary bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              asChild
              variant="accent"
              className="bg-primary text-white hover:bg-primary/90 px-5 py-2 rounded-full"
            >
              <Link href="/properties">View All</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/90">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "text-primary bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="px-5 pt-4">
              <Button asChild className="w-full bg-primary text-white rounded-full">
                <Link href="/properties" onClick={() => setIsOpen(false)}>
                  View Properties
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
