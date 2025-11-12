"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse"];
const categories = ["Buy", "Rent"];
const statuses = ["active", "pending", "sold", "rented"];
const furnishingOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];

const amenitiesList = [
  "Covered / Secure Parking",
  "Elevator / Lift",
  "24/7 Security & CCTV",
  "High-speed Internet / Wi-Fi",
  "Central Air-Conditioning",
  "Balcony / Terrace",
  "Swimming Pool (Shared or Private)",
  "Gym / Fitness Centre",
  "Spa / Sauna / Wellness Centre",
  "Rooftop Terrace / Lounge",
  "Landscaped Garden / Outdoor Seating",
  "Children’s Play Area / Family Zone",
  "Pet-friendly Facilities",
  "Smart Home Automation (lighting, HVAC, security)",
  "Co-working / Business Lounge / Meeting Room",
  "Retail / Dining Access On-site or Nearby",
  "Easy Metro / Transport Access",
  "Waterfront / Marina / Scenic View (if applicable)",
  "Private Beach / Lagoon or Waterfront Access",
  "EV Charging Station / Green Features",
  "Maid’s / Utility Room",
  "Concierge / Housekeeping Services",
];

export default function AdminDrawerForm({
  item,
  onClose,
  onSubmitSuccess,
}) {
  const formMethods = useForm({ defaultValues: item || {} });
  const { register, handleSubmit, reset, setValue, watch } = formMethods;

  const [images, setImages] = useState(
    item?.images?.map((img) =>
      typeof img === "string" ? { url: img } : img
    ) || []
  );
  const [filesToUpload, setFilesToUpload] = useState([]);

  const selectedAmenities = watch("amenities") || [];
  const furnishing = watch("furnishing") || [];

  useEffect(() => {
    reset(item || {});
    setImages(
      item?.images?.map((img) =>
        typeof img === "string" ? { url: img } : img
      ) || []
    );

    if (item?.amenities?.length) setValue("amenities", item.amenities);
    if (item?.furnishing?.length) setValue("furnishing", item.furnishing);
  }, [item, reset, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFilesToUpload((prev) => [...prev, ...files]);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...previews]);
  };

  const handleAmenityChange = (amenity, checked) => {
    const updated = checked
      ? [...selectedAmenities, amenity]
      : selectedAmenities.filter((a) => a !== amenity);
    setValue("amenities", updated);
  };

  const handleFurnishingChange = (option, checked) => {
    const updated = checked
      ? [...furnishing, option]
      : furnishing.filter((f) => f !== option);
    setValue("furnishing", updated);
  };

  async function submitForm(values) {
    try {
      const finalValues = {
        ...values,
        price: values.price ? parseFloat(values.price) : null,
        area_sqft: values.area_sqft ? parseFloat(values.area_sqft) : null,
        bedrooms: values.bedrooms ? parseInt(values.bedrooms) : null,
        bathrooms: values.bathrooms ? parseInt(values.bathrooms) : null,
        amenities: selectedAmenities,
        furnishing,
      };

      const formData = new FormData();
      formData.append("property", JSON.stringify(finalValues));
      filesToUpload.forEach((file) => formData.append("files", file));

      const endpoint = item?.id
        ? `/api/properties/update?id=${item.id}`
        : `/api/properties/add`;

      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error("❌ [DrawerForm] Error:", err);
      alert("Something went wrong — check console for details.");
    }
  }

  return (
    <Drawer open={true} onOpenChange={onClose}>
      <DrawerContent
        side="bottom"
        className="h-screen w-full bg-white shadow-xl flex flex-col overflow-hidden border-l"
      >
        <DrawerHeader className="flex justify-between items-center text-center border-b p-5 bg-muted/10">
          <DrawerTitle className="text-xl font-semibold">
            {item?.id ? "Edit Property" : "Add New Property"}
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="primary" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 w-[50rem] overflow-y-auto p-6 space-y-6">
            <FormProvider {...formMethods}>
              <Card className="p-6 space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input {...register("title", { required: true })} placeholder="Luxury Apartment Downtown" />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea {...register("description")} placeholder="Add property description" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select onValueChange={(v) => setValue("type", v)} defaultValue={item?.type || ""}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(v) => setValue("category", v)} defaultValue={item?.category || ""}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input {...register("emirate")} placeholder="Emirate" />
                  <Input {...register("community")} placeholder="Community" />
                  <Input {...register("subcommunity")} placeholder="Subcommunity" />
                  <Input {...register("address")} placeholder="Address" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input {...register("price")} placeholder="Price (AED)" type="number" />
                  <Input {...register("area_sqft")} placeholder="Area (sqft)" type="number" />
                  <Input {...register("bedrooms")} placeholder="Bedrooms" type="number" />
                  <Input {...register("bathrooms")} placeholder="Bathrooms" type="number" />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(v) => setValue("status", v)} defaultValue={item?.status || ""}>
                    <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Furnishing */}
                <div>
                  <Label className="mt-4 mb-2 font-medium">Furnishing</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {furnishingOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          checked={furnishing.includes(option)}
                          onCheckedChange={(checked) => handleFurnishingChange(option, !!checked)}
                        />
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-6">
                  <Label className="block mb-2 font-medium">Amenities</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {amenitiesList.map((a) => (
                      <div key={a} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedAmenities.includes(a)}
                          onCheckedChange={(checked) => handleAmenityChange(a, !!checked)}
                        />
                        <span className="text-sm">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </FormProvider>
          </div>

          {/* Images */}
          <div className="w-[45rem] border-l bg-muted/10 flex flex-col p-6">
            <Label className="font-medium mb-2">Property Images</Label>
            <div className="flex-1 overflow-y-auto space-y-3">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30 transition"
              >
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Images</span>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`Property ${i}`}
                      className="rounded-md object-cover w-full h-28 border"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground h-40">
                  <ImageIcon className="h-8 w-8 opacity-30 mb-2" />
                  <p className="text-sm">No images uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t flex-row-reverse bg-background/95 backdrop-blur-sm sticky bottom-0 flex justify-center gap-8 p-4">
          <DrawerClose asChild>
            <Button variant="destructive">Cancel</Button>
          </DrawerClose>
          <Button variant="neumorphic" onClick={handleSubmit(submitForm)}>
            {item?.id ? "Update Property" : "Add Property"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
