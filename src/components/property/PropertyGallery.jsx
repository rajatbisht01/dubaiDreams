"use client";
import { useState } from "react";

export default function PropertyGallery({ propertyImages }) {
  const [activeImage, setActiveImage] = useState(propertyImages?.[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Main Large Image */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden border">
        <img
          src={activeImage?.url}
          alt={activeImage?.alt || "Property Image"}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mt-3">
        {propertyImages.map((img, idx) => {
          const isActive = activeImage?.url === img.url;

          return (
            <div
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all
                ${isActive ? "border-primary opacity-100" : "border-border opacity-70 hover:opacity-100"}
              `}
            >
              <img
                src={img.url}
                alt={img.alt || "Thumbnail"}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}
