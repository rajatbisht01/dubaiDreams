"use client";

import React from "react";
import PropertyCard from "@/components/property/PropertyCard";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const PropertyGrid = ({ properties, isAdmin = false, onEdit, onDelete }) => {
  if (!properties?.length)
    return (
      <div className="text-center text-muted-foreground py-12">
        No properties found.
      </div>
    );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div
          key={property.id}
          className="relative border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition"
        >
          {/* Drawer for property preview */}
          <Drawer>
            <DrawerTrigger asChild>
              <div className="cursor-pointer">
                <PropertyCard {...property} />
              </div>
            </DrawerTrigger>

            <DrawerContent className="p-6 bg-background text-foreground w-full max-w-6xl">
              <DrawerHeader>
                <DrawerTitle>{property.title}</DrawerTitle>
                <DrawerDescription>{property.address}</DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col lg:flex-row gap-10 mt-4">
                {/* Image carousel */}
                {property.images?.length > 0 && (
                  <div className="flex-1 relative">
                    <Carousel>
                      <CarouselContent>
                        {property.images.map((img, idx) => (
                          <CarouselItem key={idx}>
                            <img
                              src={img.url}
                              alt={img.alt_text || `${property.title} ${idx + 1}`}
                              className="w-full h-96 object-cover rounded-lg shadow-md"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {property.description && (
                      <p className="text-gray-700">{property.description}</p>
                    )}
                    <p className="font-medium text-primary">
                      Price: {property.price ?? "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Beds: {property.bedrooms ?? "N/A"}, Baths:{" "}
                      {property.bathrooms ?? "N/A"}, Area: {property.area_sqft ?? "N/A"} sqft
                    </p>
                  </div>

                  {/* Admin actions inside drawer too (optional) */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-6">
                      <Button
                        onClick={() => onEdit(property)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDelete(property.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DrawerFooter className="mt-6">
                <DrawerClose className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
                  Close
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* ✅ Admin Buttons — visible directly on grid cards */}
          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering drawer
                  onEdit(property);
                }}
              >
                <Pencil className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(property.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
