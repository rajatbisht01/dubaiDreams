"use client";

import React from "react";

import Carousel from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

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

          <div className="flex flex-col  ">
            {/* Image carousel */}
           
            {property.images?.length > 0 ? (
              <Carousel
                items={property.images.map((img) =>
                  typeof img === "string"
                    ? { url: img }
                    : { url: img.url, alt: img.alt_text }
                )}
                baseWidth="100%"
                height={384}
                autoplay={true}
                autoplayDelay={4000}
                pauseOnHover={true}
                loop={true}
                gap={8}
                round={false}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}

            {/* Info */}
            <div className="flex-1 flex flex-col p-4 justify-between">
              <div className="space-y-4">
                {property.title && (
                  <p className="text-gray-700">{property.title}</p>
                )}
                <p className="font-medium text-primary">
                  Price: {property.price ?? "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Beds: {property.bedrooms ?? "N/A"}, Baths:{" "}
                  {property.bathrooms ?? "N/A"}, Area:{" "}
                  {property.area_sqft ?? "N/A"} sqft
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
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
