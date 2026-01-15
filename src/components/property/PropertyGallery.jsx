"use client";
import { useState } from "react";

export default function PropertyGallery({ propertyImages }) {
  const [activeImage, setActiveImage] = useState(propertyImages?.[0]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      
      {/* Main Image */}
      <div className="flex items-center justify-center rounded-lg overflow-hidden">
        <img
          src={activeImage?.url}
          alt={activeImage?.alt || "Property Image"}
          className="max-w-full  rounded-2xl max-h-[80vh] object-contain transition-all duration-300"
        />
      </div>

      {/* Thumbnail Strip (CENTERED) */}
      <div className="flex justify-center mt-4">
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {propertyImages.map((img, idx) => {
            const isActive = activeImage?.url === img.url;

            return (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all
                  ${
                    isActive
                      ? "border-primary opacity-100"
                      : "border-border opacity-70 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={img.url}
                  alt={img.alt || "Thumbnail"}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
