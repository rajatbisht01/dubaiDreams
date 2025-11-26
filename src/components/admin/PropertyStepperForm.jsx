"use client";

import React, { useEffect, useState } from "react";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon } from "lucide-react";

export default function PropertyStepperForm({ item = null, onClose = () => {}, onSuccess = () => {} }) {
  const isEdit = !!item?.id;
  const [loading, setLoading] = useState(false);

  const [lookups, setLookups] = useState({
    propertyTypes: [],
    developers: [],
    communities: [],
    amenities: [],
    features: [],
    statusTypes: [],
    viewTypes: [],
    nearbyCategories: [],
    documentTypes: [],
  });
  const [error, setError] = useState(null);

  const [payload, setPayload] = useState({
    title: "",
    slug: "",
    description: "",
    developer_id: null,
    community_id: null,
    property_type_id: null,
    status_id: null,
    starting_price: "",
    price_range: "",
    bedrooms: "",
    bathrooms: "",
    size_range: "",
    handover: "",
    roi: "",
    service_charge: "",
    market_price_psf: "",
    rental_price_psf: "",
    annual_rent: "",
    estimated_yield: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image_url: "",
    amenities: [],
    features: [],
    views: [],
    nearby_points: [],
    construction_updates: [],
    imageFiles: [],
    documentFiles: [],
    floorPlanFiles: [],
  });

  useEffect(() => {
    fetchLookups();
    if (item) {
      seedFromItem(item);
    }
  }, [item]);

  async function fetchLookups() {
    try {
      const res = await fetch("/api/lookup");
      const data = await res.json();
      setLookups(data);
    } catch (err) {
      console.error("Failed to fetch lookups", err);
      setError("Failed to fetch lookups");
    }
  }

  function seedFromItem(it) {
    setPayload((p) => ({
      ...p,
      title: it.title || "",
      slug: it.slug || "",
      description: it.description || "",
      developer_id: it.developer_id || null,
      community_id: it.community_id || null,
      property_type_id: it.property_type_id || null,
      status_id: it.status_id || null,
      starting_price: it.starting_price || "",
      price_range: it.price_range || "",
      bedrooms: it.bedrooms || "",
      bathrooms: it.bathrooms || "",
      size_range: it.size_range || "",
      handover: it.handover || "",
      roi: it.roi || "",
      service_charge: it.service_charge || "",
      market_price_psf: it.market_price_psf || "",
      rental_price_psf: it.rental_price_psf || "",
      annual_rent: it.annual_rent || "",
      estimated_yield: it.estimated_yield || "",
      meta_title: it.meta_title || "",
      meta_description: it.meta_description || "",
      meta_keywords: it.meta_keywords || "",
      og_image_url: it.og_image_url || "",
      amenities: Array.isArray(it.amenities) ? it.amenities.map(a => a.amenity_id || a.id) : [],
      features: Array.isArray(it.features) ? it.features.map(f => f.feature_id || f.id) : [],
      views: Array.isArray(it.views) ? it.views.map(v => v.view_type_id || v.id) : [],
      imageFiles: [],
      documentFiles: [],
      floorPlanFiles: [],
      nearby_points: it.property_nearby_points || [],
      construction_updates: it.construction_updates || [],
    }));
  }

  function setField(field, value) {
    setPayload((p) => ({ ...p, [field]: value }));
  }

  function handleImageFiles(e) {
    const files = Array.from(e.target.files || []);
    setPayload((p) => ({ ...p, imageFiles: [...(p.imageFiles || []), ...files] }));
  }
  
  function handleDocumentFiles(e) {
    const files = Array.from(e.target.files || []).map((f) => ({ file: f, title: f.name, document_type_id: null }));
    setPayload((p) => ({ ...p, documentFiles: [...(p.documentFiles || []), ...files] }));
  }
  
  function handleFloorPlanFiles(e) {
    const files = Array.from(e.target.files || []).map((f) => ({ file: f, title: f.name, size: "" }));
    setPayload((p) => ({ ...p, floorPlanFiles: [...(p.floorPlanFiles || []), ...files] }));
  }

  function addNearbyPoint() {
    setPayload((p) => ({ ...p, nearby_points: [...(p.nearby_points || []), { category_id: null, name: "", distance_in_km: "", distance_in_minutes: "" }] }));
  }
  
  function updateNearbyPoint(idx, key, val) {
    setPayload((p) => {
      const next = [...(p.nearby_points || [])];
      next[idx] = { ...next[idx], [key]: val };
      return { ...p, nearby_points: next };
    });
  }
  
  function removeNearbyPoint(idx) {
    setPayload((p) => {
      const next = [...(p.nearby_points || [])];
      next.splice(idx, 1);
      return { ...p, nearby_points: next };
    });
  }

  function addConstructionUpdate() {
    setPayload((p) => ({ ...p, construction_updates: [...(p.construction_updates || []), { update_text: "", progress_percent: 0, update_date: "" }] }));
  }
  
  function updateConstructionUpdate(idx, key, val) {
    setPayload((p) => {
      const next = [...(p.construction_updates || [])];
      next[idx] = { ...next[idx], [key]: val };
      return { ...p, construction_updates: next };
    });
  }
  
  function removeConstructionUpdate(idx) {
    setPayload((p) => {
      const next = [...(p.construction_updates || [])];
      next.splice(idx, 1);
      return { ...p, construction_updates: next };
    });
  }

  function toggleAssoc(listName, id) {
    setPayload((p) => {
      const cur = new Set(p[listName] || []);
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
      return { ...p, [listName]: Array.from(cur) };
    });
  }

  // FIXED: Upload with file type parameter
  async function uploadFile(file, fileType) {
    const form = new FormData();
    form.append("file", file);
    form.append("fileType", fileType); // "image" | "document" | "floorplan"
    
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "upload failed" }));
      throw new Error(err?.error || "Upload failed");
    }
    const d = await res.json();
    console.log(`Uploaded ${fileType}:`, d.file);
    return d.file;
  }

  async function handleFinalSubmit() {
    setLoading(true);
    setError(null);

    try {
      // 1) Upload images to property-images bucket
      const uploadedImageUrls = [];
      for (const f of payload.imageFiles || []) {
        const url = await uploadFile(f, "image");
        uploadedImageUrls.push(url);
      }

      // 2) Upload documents to property-documents bucket
      const uploadedDocuments = [];
      for (const d of payload.documentFiles || []) {
        const url = await uploadFile(d.file, "document");
        uploadedDocuments.push({
          url,
          title: d.title,
          document_type_id: d.document_type_id
        });
      }

      // 3) Upload floor plans to property-documents bucket
      const uploadedFloorPlans = [];
      for (const fp of payload.floorPlanFiles || []) {
        const url = await uploadFile(fp.file, "document");
        uploadedFloorPlans.push({
          url,
          title: fp.title,
          size: fp.size
        });
      }

      // 4) Build property payload
      const propertyPayload = {
        title: payload.title,
        slug: payload.slug?.trim() !== "" ? payload.slug : payload.title?.toLowerCase().replace(/\s+/g, "-").slice(0, 200),
        description: payload.description,
        developer_id: payload.developer_id,
        community_id: payload.community_id,
        property_type_id: payload.property_type_id,
        status_id: payload.status_id,
        starting_price: payload.starting_price || null,
        price_range: payload.price_range || null,
        bedrooms: payload.bedrooms || null,
        bathrooms: payload.bathrooms || null,
        size_range: payload.size_range || null,
        handover: payload.handover || null,
        roi: payload.roi || null,
        service_charge: payload.service_charge || null,
        market_price_psf: payload.market_price_psf || null,
        rental_price_psf: payload.rental_price_psf || null,
        annual_rent: payload.annual_rent || null,
        estimated_yield: payload.estimated_yield || null,
        meta_title: payload.meta_title || null,
        meta_description: payload.meta_description || null,
        meta_keywords: payload.meta_keywords || null,
        og_image_url: payload.og_image_url || null,
        amenities: payload.amenities || [],
        features: payload.features || [],
        views: payload.views || [],
      };

      // 5) Create or update property
      const url = isEdit ? `/api/admin/properties/${item.id}` : `/api/admin/properties`;
      const method = isEdit ? "PUT" : "POST";

      const saveRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyPayload),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({ error: "save error" }));
        throw new Error(err.error || "Failed to save property");
      }

      const saved = await saveRes.json();
      const propertyId = saved.id;

      if (!propertyId) throw new Error("No property ID returned");

      console.log("Property saved:", propertyId);
      console.log("Uploading media:", { images: uploadedImageUrls.length, docs: uploadedDocuments.length, floors: uploadedFloorPlans.length });

      // 6) Attach images
      for (const imgUrl of uploadedImageUrls) {
        const imgRes = await fetch(`/api/properties/${propertyId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: imgUrl,
            is_featured: false,
            sort_order: 0,
          }),
        });
        if (!imgRes.ok) {
          console.error("Failed to save image:", await imgRes.text());
        }
      }

      // 7) Attach documents
      for (const doc of uploadedDocuments) {
        const docRes = await fetch(`/api/properties/${propertyId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_type_id: doc.document_type_id,
            title: doc.title,
            file_url: doc.url,
            sort_order: 0,
          }),
        });
        if (!docRes.ok) {
          console.error("Failed to save document:", await docRes.text());
        }
      }

      // 8) Attach floor plans
      for (const fp of uploadedFloorPlans) {
        const fpRes = await fetch(`/api/properties/${propertyId}/floor-plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fp.title,
            size: fp.size,
            pdf_url: fp.url,
          }),
        });
        if (!fpRes.ok) {
          console.error("Failed to save floor plan:", await fpRes.text());
        }
      }

      // 9) Attach nearby points
      for (const np of payload.nearby_points || []) {
        if (np.name && np.category_id) {
          await fetch(`/api/properties/${propertyId}/nearby-points`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(np),
          });
        }
      }

      // 10) Attach construction updates
      for (const cu of payload.construction_updates || []) {
        if (cu.update_text) {
          await fetch(`/api/properties/${propertyId}/construction-updates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cu),
          });
        }
      }

      setLoading(false);
      onSuccess();
      onClose();
      alert(isEdit ? "Property updated!" : "Property created!");

    } catch (err) {
      console.error("Final submit error", err);
      setError(err.message || "Error");
      setLoading(false);
      alert(err.message || "Submit failed");
    }
  }

  function removeFileFromList(listKey, index) {
    setPayload((p) => {
      const arr = [...(p[listKey] || [])];
      arr.splice(index, 1);
      return { ...p, [listKey]: arr };
    });
  }

  return (
    <div className="p-2">
      <Stepper
        initialStep={1}
        stepCircleContainerClassName="bg-black/70"
        contentClassName="bg-secondary"
        footerClassName=""
        backButtonText="Back"
        nextButtonText="Next"
      >
        {/* Step 1: Basic Info */}
        <Step>
          <div className="space-y-4">
            <Label>Title</Label>
            <Input value={payload.title} onChange={(e) => setField("title", e.target.value)} placeholder="Title" />

            <Label>Slug (optional)</Label>
            <Input value={payload.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="slug" />

            <Label>Description</Label>
            <Textarea value={payload.description} onChange={(e) => setField("description", e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Developer</Label>
                <select value={payload.developer_id || ""} onChange={(e) => setField("developer_id", e.target.value || null)} className="w-full border rounded p-2">
                  <option value="">Select developer</option>
                  {lookups.developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Community</Label>
                <select value={payload.community_id || ""} onChange={(e) => setField("community_id", e.target.value || null)} className="w-full border rounded p-2">
                  <option value="">Select community</option>
                  {lookups.communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property Type</Label>
                <select value={payload.property_type_id || ""} onChange={(e) => setField("property_type_id", e.target.value || null)} className="w-full border rounded p-2">
                  <option value="">Select type</option>
                  {lookups.propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Status</Label>
                <select value={payload.status_id || ""} onChange={(e) => setField("status_id", e.target.value || null)} className="w-full border rounded p-2">
                  <option value="">Select status</option>
                  {lookups.statusTypes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Step>

        {/* Step 2: Pricing */}
        <Step>
          <div className="space-y-4">
            <Label>Starting Price</Label>
            <Input value={payload.starting_price} onChange={(e) => setField("starting_price", e.target.value)} type="number" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price Range</Label>
                <Input value={payload.price_range} onChange={(e) => setField("price_range", e.target.value)} />
              </div>
              <div>
                <Label>Bedrooms</Label>
                <Input value={payload.bedrooms} onChange={(e) => setField("bedrooms", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bathrooms</Label>
                <Input value={payload.bathrooms} onChange={(e) => setField("bathrooms", e.target.value)} />
              </div>
              <div>
                <Label>Size Range</Label>
                <Input value={payload.size_range} onChange={(e) => setField("size_range", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ROI</Label>
                <Input value={payload.roi} onChange={(e) => setField("roi", e.target.value)} />
              </div>
              <div>
                <Label>Service Charge</Label>
                <Input value={payload.service_charge} onChange={(e) => setField("service_charge", e.target.value)} />
              </div>
            </div>
          </div>
        </Step>

        {/* Step 3: Images */}
        <Step>
          <div>
            <Label>Upload Images (multiple files supported)</Label>
            <label className="block mt-2">
              <input type="file" accept="image/*" multiple onChange={handleImageFiles} />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(payload.imageFiles || []).map((f, i) => (
                <div key={i} className="p-1 border rounded relative">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover rounded" />
                  <button type="button" onClick={() => removeFileFromList("imageFiles", i)} className="absolute top-1 right-1 bg-white rounded px-1">x</button>
                </div>
              ))}
              {(!payload.imageFiles || payload.imageFiles.length === 0) && (
                <div className="col-span-3 text-center text-sm text-muted-foreground p-6 border rounded">
                  <ImageIcon className="mx-auto mb-2" />
                  No images selected
                </div>
              )}
            </div>
          </div>
        </Step>

        {/* Step 4: Documents & Floor Plans */}
        <Step>
          <div className="space-y-3 mb-8">
            <Label>Upload Documents (Brochure, RERA, etc)</Label>
            <input type="file" multiple onChange={handleDocumentFiles} />
            {(payload.documentFiles || []).map((d, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className="border p-1 flex-1" value={d.title} onChange={(e) => {
                  const arr = [...payload.documentFiles]; arr[idx] = { ...arr[idx], title: e.target.value }; setPayload(p=>({ ...p, documentFiles: arr }));
                }} />
                <select className="border p-1" value={d.document_type_id || ""} onChange={(e) => {
                  const arr = [...payload.documentFiles]; arr[idx] = { ...arr[idx], document_type_id: e.target.value || null }; setPayload(p=>({ ...p, documentFiles: arr }));
                }}>
                  <option value="">-- type --</option>
                  {lookups.documentTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                </select>
                <button onClick={() => removeFileFromList("documentFiles", idx)} className="px-2">Remove</button>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <Label>Upload Floor Plans (PDF)</Label>
            <input type="file" accept="application/pdf" multiple onChange={handleFloorPlanFiles} />
            {(payload.floorPlanFiles || []).map((d, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className="border p-1 flex-1" value={d.title} onChange={(e) => {
                  const arr = [...payload.floorPlanFiles]; arr[idx] = { ...arr[idx], title: e.target.value }; setPayload(p=>({ ...p, floorPlanFiles: arr }));
                }} />
                <input className="border p-1" placeholder="size (e.g., 1200 sqft)" value={d.size} onChange={(e) => {
                  const arr = [...payload.floorPlanFiles]; arr[idx] = { ...arr[idx], size: e.target.value }; setPayload(p=>({ ...p, floorPlanFiles: arr }));
                }} />
                <button onClick={() => removeFileFromList("floorPlanFiles", idx)} className="px-2">Remove</button>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 5: Amenities */}
        <Step>
          <div>
            <Label>Choose Amenities</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-24 overflow-y-auto border p-2">
              {lookups.amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2">
                  <Checkbox checked={(payload.amenities || []).includes(a.id)} onCheckedChange={() => toggleAssoc("amenities", a.id)} />
                  <span>{a.name}</span>
                </label>
              ))}
            </div>

            <Label className="mt-4">Choose Features</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-24 overflow-y-auto border p-2">
              {lookups.features.map((f) => (
                <label key={f.id} className="flex items-center gap-2">
                  <Checkbox checked={(payload.features || []).includes(f.id)} onCheckedChange={() => toggleAssoc("features", f.id)} />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>

            <Label className="mt-4">Choose Views</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-24 overflow-y-auto border p-2">
              {lookups.viewTypes.map((v) => (
                <label key={v.id} className="flex items-center gap-2">
                  <Checkbox checked={(payload.views || []).includes(v.id)} onCheckedChange={() => toggleAssoc("views", v.id)} />
                  <span>{v.name}</span>
                </label>
              ))}
            </div>
          </div>
        </Step>

        {/* Step 6: Nearby Points & Construction Updates */}
        <Step>
          <div className="mb-8">
            <Label>Nearby Points</Label>
            <div className="space-y-2">
              {(payload.nearby_points || []).map((np, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                  <select className="col-span-2 border p-1" value={np.category_id || ""} onChange={(e) => updateNearbyPoint(idx, "category_id", e.target.value || null)}>
                    <option value="">Category</option>
                    {lookups.nearbyCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="col-span-2 border p-1" value={np.name} onChange={(e) => updateNearbyPoint(idx, "name", e.target.value)} placeholder="Name" />
                  <input className="p-1 border" value={np.distance_in_km} onChange={(e) => updateNearbyPoint(idx, "distance_in_km", e.target.value)} placeholder="km" />
                  <input className="p-1 border" value={np.distance_in_minutes} onChange={(e) => updateNearbyPoint(idx, "distance_in_minutes", e.target.value)} placeholder="mins" />
                  <button className="col-span-6 mt-1 text-sm text-red-600" onClick={() => removeNearbyPoint(idx)}>Remove</button>
                </div>
              ))}
              <button onClick={addNearbyPoint} className="mt-2 px-3 py-1 bg-gray-100 rounded">Add Nearby Point</button>
            </div>
          </div>

          <div>
            <Label>Construction Updates</Label>
            <div className="space-y-2">
              {(payload.construction_updates || []).map((cu, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                  <textarea className="col-span-3 border p-1" value={cu.update_text} onChange={(e) => updateConstructionUpdate(idx, "update_text", e.target.value)} placeholder="Update text" />
                  <input className="col-span-1 border p-1" value={cu.progress_percent} onChange={(e) => updateConstructionUpdate(idx, "progress_percent", e.target.value)} placeholder="percent" />
                  <input className="col-span-2 border p-1" type="date" value={cu.update_date || ""} onChange={(e) => updateConstructionUpdate(idx, "update_date", e.target.value)} />
                  <button className="col-span-6 mt-1 text-sm text-red-600" onClick={() => removeConstructionUpdate(idx)}>Remove</button>
                </div>
              ))}
              <button onClick={addConstructionUpdate} className="mt-2 px-3 py-1 bg-gray-100 rounded">Add Update</button>
            </div>
          </div>
        </Step>

        {/* Step 7: Review & Submit */}
        <Step>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Submit</h3>

            <div className="border p-3 rounded">
              <p><strong>Title:</strong> {payload.title}</p>
              <p><strong>Developer:</strong> {lookups.developers.find(d=>d.id===payload.developer_id)?.name || "-"}</p>
              <p><strong>Community:</strong> {lookups.communities.find(c=>c.id===payload.community_id)?.name || "-"}</p>
              <p><strong>Type:</strong> {lookups.propertyTypes.find(t=>t.id===payload.property_type_id)?.name || "-"}</p>
              <p><strong>Status:</strong> {lookups.statusTypes.find(s=>s.id===payload.status_id)?.name || "-"}</p>
              <p><strong>Starting Price:</strong> {payload.starting_price || "-"}</p>
              <p><strong>Amenities:</strong> {(payload.amenities || []).map(id=>lookups.amenities.find(a=>a.id===id)?.name).filter(Boolean).join(", ") || "-"}</p>
              <p><strong>Images:</strong> {(payload.imageFiles || []).length} files selected</p>
              <p><strong>Documents:</strong> {(payload.documentFiles || []).length} files selected</p>
              <p><strong>Floor Plans:</strong> {(payload.floorPlanFiles || []).length} files selected</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose} variant="destructive">Cancel</Button>
              <Button onClick={handleFinalSubmit} disabled={loading}>{loading ? "Saving..." : (isEdit ? "Update Property" : "Create Property")}</Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Step>
      </Stepper>
    </div>
  );
}