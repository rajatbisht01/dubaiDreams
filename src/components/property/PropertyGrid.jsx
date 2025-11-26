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
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.map((property) => (
        <div
          key={property.id}
          className="relative  border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition"
        >
          {/* Image carousel */}
          {property.property_images?.length > 0 ? (
            <Carousel
              items={property.property_images.map((img) => ({
                url: img.image_url ?? "", // fallback if url missing
                alt: img.alt_text ?? property.title ?? "Property Image",
              }))}
              baseWidth="100%"
              height={204}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              gap={8}
              round={false}
            />
          ) : (
            <div className="w-full  bg-gray-200 flex items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}

          {/* Info */}
          <div className="flex-1 flex flex-col p-4 justify-between">
            <div className="space-y-2">
              <p className="text-gray-700 font-semibold">{property.title ?? "N/A"}</p>
              <p className="font-medium text-primary">
                Price: {property.starting_price ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Beds: {property.bedrooms ?? "N/A"}, Baths: {property.bathrooms ?? "N/A"}, Area: {property.size_range ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Community: {property.communities?.name ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {property.property_status_types?.name ?? "N/A"}
              </p>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-2 mt-4">
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
      ))}
    </div>
  );
};

export default PropertyGrid;
