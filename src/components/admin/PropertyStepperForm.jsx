"use client";

import React, { useEffect, useState, useMemo } from "react";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STORAGE_KEY = "property_form_draft";

export default function PropertyStepperForm({ item = null, onClose = () => {}, onSuccess = () => {} }) {
  const isEdit = !!item?.id;
  const [loading, setLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

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
    isFeatured: false,
    description: "",
    developer_id: null,
    community_id: null,
    property_type_id: null,
    status_id: null,
    latitude: "",
    longitude: "",
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
    existingImages: [],
    existingDocuments: [],
    existingFloorPlans: [],
    imagesToDelete: [],
    documentsToDelete: [],
    floorPlansToDelete: [],
  });

  // Load draft on mount for create mode
  useEffect(() => {
    fetchLookups();
    
    if (item?.id) {
      // Edit mode - load the item
      seedFromItem(item);
    } else {
      // Create mode - check for draft
      loadDraft();
    }
  }, []);

  // Auto-save draft when payload changes (only in create mode)
  useEffect(() => {
    if (!isEdit && payload.title) {
      saveDraft();
    }
  }, [payload, isEdit]);

  function loadDraft() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft = JSON.parse(stored);
        setPayload(draft);
        setHasDraft(true);
      }
    } catch (error) {
      console.log("No draft found or error loading draft");
    }
  }

  function saveDraft() {
    try {
      // Only save serializable data (exclude File objects)
      const draftData = {
        ...payload,
        imageFiles: [], // Files can't be serialized
        documentFiles: [],
        floorPlanFiles: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }

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
    console.log("Seeding form with item:", it);
    
    setPayload((p) => ({
      ...p,
      title: it.title || "",
      slug: it.slug || "",
      isFeatured: it.isFeatured ?? false,
      description: it.description || "",
      developer_id: it.developer_id || null,
      community_id: it.community_id || null,
      property_type_id: it.property_type_id || null,
      status_id: it.status_id || null,
      latitude: it.latitude || "",
      longitude: it.longitude || "",
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
      
      amenities: Array.isArray(it.property_amenities) 
        ? it.property_amenities.map(a => a.amenity_id) 
        : [],
      
      features: Array.isArray(it.property_features) 
        ? it.property_features.map(f => f.feature_id) 
        : [],
      
      views: Array.isArray(it.property_views) 
        ? it.property_views.map(v => v.view_type_id) 
        : [],
      
      nearby_points: Array.isArray(it.property_nearby_points) 
        ? it.property_nearby_points.map(np => ({
            id: np.id,
            category_id: np.category_id,
            name: np.name || "",
            distance_in_km: np.distance_in_km || "",
            distance_in_minutes: np.distance_in_minutes || ""
          })) 
        : [],
      
      construction_updates: Array.isArray(it.construction_updates) 
        ? it.construction_updates.map(cu => ({
            id: cu.id,
            update_text: cu.update_text || "",
            progress_percent: cu.progress_percent || "",
            update_date: cu.update_date || ""
          })) 
        : [],
      
      existingImages: Array.isArray(it.property_images) ? it.property_images : [],
      existingDocuments: Array.isArray(it.property_documents) ? it.property_documents : [],
      existingFloorPlans: Array.isArray(it.floor_plans) ? it.floor_plans : [],
      
      imageFiles: [],
      documentFiles: [],
      floorPlanFiles: [],
      imagesToDelete: [],
      documentsToDelete: [],
      floorPlansToDelete: [],
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

  function markExistingImageForDeletion(imageId) {
    setPayload((p) => ({
      ...p,
      imagesToDelete: [...p.imagesToDelete, imageId],
      existingImages: p.existingImages.filter(img => img.id !== imageId)
    }));
  }

  function markExistingDocumentForDeletion(docId) {
    setPayload((p) => ({
      ...p,
      documentsToDelete: [...p.documentsToDelete, docId],
      existingDocuments: p.existingDocuments.filter(doc => doc.id !== docId)
    }));
  }

  function markExistingFloorPlanForDeletion(fpId) {
    setPayload((p) => ({
      ...p,
      floorPlansToDelete: [...p.floorPlansToDelete, fpId],
      existingFloorPlans: p.existingFloorPlans.filter(fp => fp.id !== fpId)
    }));
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

  async function uploadFile(file, fileType) {
    const form = new FormData();
    form.append("file", file);
    form.append("fileType", fileType);
    
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const d = await res.json();
    return d.file;
  }

  async function postBatch(url, dataArray) {
    if (!dataArray.length) return;
    return Promise.allSettled(
      dataArray.map(data =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      )
    );
  }

  async function deleteBatch(url, ids) {
    if (!ids.length) return;
    return Promise.allSettled(
      ids.map(id =>
        fetch(`${url}/${id}`, { method: "DELETE" })
      )
    );
  }

  async function handleFinalSubmit() {
    setLoading(true);
    setError(null);

    const successMessage = isEdit ? "Property updated!" : "Property created!";
    
    try {
      const propertyPayload = {
        title: payload.title,
        isFeatured: payload.isFeatured,
        slug: payload.slug?.trim() || payload.title?.toLowerCase().replace(/\s+/g, "-").slice(0, 200),
        description: payload.description,
        developer_id: payload.developer_id,
        community_id: payload.community_id,
        property_type_id: payload.property_type_id,
        status_id: payload.status_id,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
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
        nearby_points: payload.nearby_points || [],
        construction_updates: payload.construction_updates || [],
      };

      console.log("[Form Submit] Payload:", {
        latitude: propertyPayload.latitude,
        longitude: propertyPayload.longitude,
        amenities: propertyPayload.amenities,
        features: propertyPayload.features,
        views: propertyPayload.views,
        nearby_count: propertyPayload.nearby_points?.length,
        updates_count: propertyPayload.construction_updates?.length
      });

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

      // Clear draft on successful creation
      if (!isEdit) {
        clearDraft();
      }

      toast.success(successMessage);
      onSuccess();
      onClose();
      setLoading(false);

      (async () => {
        try {
          await Promise.allSettled([
            deleteBatch(`/api/properties/${propertyId}/images`, payload.imagesToDelete),
            deleteBatch(`/api/properties/${propertyId}/documents`, payload.documentsToDelete),
            deleteBatch(`/api/properties/${propertyId}/floor-plans`, payload.floorPlansToDelete),
          ]);

          const [imageUrls, documentData, floorPlanData] = await Promise.all([
            Promise.all((payload.imageFiles || []).map(f => uploadFile(f, "image"))),
            Promise.all((payload.documentFiles || []).map(async (d) => ({
              url: await uploadFile(d.file, "document"),
              title: d.title,
              document_type_id: d.document_type_id
            }))),
            Promise.all((payload.floorPlanFiles || []).map(async (fp) => ({
              url: await uploadFile(fp.file, "document"),
              title: fp.title,
              size: fp.size
            })))
          ]);

          await Promise.allSettled([
            postBatch(
              `/api/properties/${propertyId}/images`,
              imageUrls.map((url, idx) => ({
                image_url: url,
                isFeatured: false,
                sort_order: idx,
              }))
            ),
            postBatch(
              `/api/properties/${propertyId}/documents`,
              documentData.map((doc, idx) => ({
                document_type_id: doc.document_type_id,
                title: doc.title,
                file_url: doc.url,
                sort_order: idx,
              }))
            ),
            postBatch(
              `/api/properties/${propertyId}/floor-plans`,
              floorPlanData.map((fp) => ({
                title: fp.title,
                size: fp.size,
                pdf_url: fp.url,
              }))
            ),
          ]);

        } catch (bgErr) {
          console.error("Background upload error:", bgErr);
          toast.error("Some media uploads failed. Please re-edit the property.");
        }
      })();

    } catch (err) {
      console.error("Property save error", err);
      setError(err.message || "Error");
      setLoading(false);
      toast.error(err.message || "Failed to save property");
    }
  }

  function removeFileFromList(listKey, index) {
    setPayload((p) => {
      const arr = [...(p[listKey] || [])];
      arr.splice(index, 1);
      return { ...p, [listKey]: arr };
    });
  }

  const imagePreviews = useMemo(() => 
    (payload.imageFiles || []).map((f, i) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      index: i
    })),
    [payload.imageFiles]
  );

  return (
    <div className="">
      {!isEdit && hasDraft && (
        <Alert className="border-0 p-0">
          <AlertDescription>
            Your progress has been saved. Continue where you left off or{" "}
            <button
              onClick={() => {
                clearDraft();
                window.location.reload();
              }}
              className="underline font-semibold"
            >
              start fresh
            </button>
            .
          </AlertDescription>
        </Alert>
      )}

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
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                checked={payload.isFeatured}
                onCheckedChange={(v) => setField("isFeatured", v)}
              />
              <Label>Featured Property?</Label>
            </div>

            <Label>Description</Label>
            <Textarea className={'ring-1'} value={payload.description} onChange={(e) => setField("description", e.target.value)} />
          
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
                <Label>Latitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={payload.latitude} 
                  onChange={(e) => setField("latitude", e.target.value)} 
                  placeholder="e.g., 25.2048" 
                />
              </div>

              <div>
                <Label>Longitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={payload.longitude} 
                  onChange={(e) => setField("longitude", e.target.value)} 
                  placeholder="e.g., 55.2708" 
                />
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
            <Label>Starting Price (AED)</Label>
            <Input value={payload.starting_price} onChange={(e) => setField("starting_price", e.target.value)} type="number" />

            <div>
              <Label>Price Range (AED)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input 
                  type="number"
                  placeholder="Min Price" 
                  value={payload.price_range ? payload.price_range.split('-')[0] : ''} 
                  onChange={(e) => {
                    const min = e.target.value;
                    const max = payload.price_range ? payload.price_range.split('-')[1] : '';
                    setField("price_range", min && max ? `${min}-${max}` : min);
                  }} 
                />
                <Input 
                  type="number"
                  placeholder="Max Price" 
                  value={payload.price_range ? payload.price_range.split('-')[1] : ''} 
                  onChange={(e) => {
                    const min = payload.price_range ? payload.price_range.split('-')[0] : '';
                    const max = e.target.value;
                    setField("price_range", min && max ? `${min}-${max}` : max);
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input value={payload.bedrooms} onChange={(e) => setField("bedrooms", e.target.value)} />
              </div>
              <div>
                <Label>Estimated Yield (%)</Label>
                <Input value={payload.estimated_yield} onChange={(e) => setField("estimated_yield", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Size Range (sqft)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input 
                  type="number"
                  placeholder="Min Size" 
                  value={payload.size_range ? payload.size_range.split('-')[0] : ''} 
                  onChange={(e) => {
                    const min = e.target.value;
                    const max = payload.size_range ? payload.size_range.split('-')[1] : '';
                    setField("size_range", min && max ? `${min}-${max}` : min);
                  }} 
                />
                <Input 
                  type="number"
                  placeholder="Max Size" 
                  value={payload.size_range ? payload.size_range.split('-')[1] : ''} 
                  onChange={(e) => {
                    const min = payload.size_range ? payload.size_range.split('-')[0] : '';
                    const max = e.target.value;
                    setField("size_range", min && max ? `${min}-${max}` : max);
                  }} 
                />
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
            {isEdit && payload.existingImages.length > 0 && (
              <div className="mb-6">
                <Label>Existing Images</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {payload.existingImages.map((img) => (
                    <div key={img.id} className="p-1 border rounded relative group">
                      <img src={img.image_url} alt="property" className="w-full h-24 object-cover rounded" />
                      <button 
                        type="button" 
                        onClick={() => markExistingImageForDeletion(img.id)} 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Label>Upload New Images</Label>
            <label className="block mt-2">
              <input type="file" accept="image/*" multiple onChange={handleImageFiles} />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {imagePreviews.map(({ url, name, index }) => (
                <div key={index} className="p-1 border rounded relative">
                  <img src={url} alt={name} className="w-full h-24 object-cover rounded" />
                  <button type="button" onClick={() => removeFileFromList("imageFiles", index)} className="absolute top-1 right-1 bg-white rounded px-1">×</button>
                </div>
              ))}
              {imagePreviews.length === 0 && !isEdit && (
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
          {isEdit && payload.existingDocuments.length > 0 && (
            <div className="space-y-2 mb-6">
              <Label>Existing Documents</Label>
              {payload.existingDocuments.map((doc) => (
                <div key={doc.id} className="flex gap-2 items-center border p-2 rounded">
                  <span className="flex-1">{doc.title}</span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">View</a>
                  <button onClick={() => markExistingDocumentForDeletion(doc.id)} className="text-red-600">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-8">
            <Label>Upload New Documents (Brochure, RERA, etc)</Label>
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
                <button onClick={() => removeFileFromList("documentFiles", idx)} className="px-2">×</button>
              </div>
            ))}
          </div>

          {isEdit && payload.existingFloorPlans.length > 0 && (
            <div className="space-y-2 mb-6">
              <Label>Existing Floor Plans</Label>
              {payload.existingFloorPlans.map((fp) => (
                <div key={fp.id} className="flex gap-2 items-center border p-2 rounded">
                  <span className="flex-1">{fp.title} {fp.size && `(${fp.size})`}</span>
                  <a href={fp.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">View</a>
                  <button onClick={() => markExistingFloorPlanForDeletion(fp.id)} className="text-red-600">×</button>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-3">
            <Label>Upload New Floor Plans (PDF)</Label>
            <input type="file" accept="application/pdf" multiple onChange={handleFloorPlanFiles} />
            {(payload.floorPlanFiles || []).map((d, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className="border p-1 flex-1" value={d.title} onChange={(e) => {
                  const arr = [...payload.floorPlanFiles]; arr[idx] = { ...arr[idx], title: e.target.value }; setPayload(p=>({ ...p, floorPlanFiles: arr }));
                }} />
                <input className="border p-1" placeholder="size (e.g., 1200 sqft)" value={d.size} onChange={(e) => {
                  const arr = [...payload.floorPlanFiles]; arr[idx] = { ...arr[idx], size: e.target.value }; setPayload(p=>({ ...p, floorPlanFiles: arr }));
                }} />
                <button onClick={() => removeFileFromList("floorPlanFiles", idx)} className="px-2">×</button>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 5: Amenities */}
        <Step>
          <div className="space-y-4">
            <div>
              <Label>Choose Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-64 overflow-y-auto border p-3 rounded-md">
                {lookups.amenities.map((a) => (
                  <label key={a.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={(payload.amenities || []).includes(a.id)}
                      onCheckedChange={() => toggleAssoc("amenities", a.id)}
                    />
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Choose Features</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-64 overflow-y-auto border p-3 rounded-md">
                {lookups.features.map((f) => (
                  <label key={f.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={(payload.features || []).includes(f.id)}
                      onCheckedChange={() => toggleAssoc("features", f.id)}
                    />
                    <span className="text-sm">{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

           
            <div>
              <Label>Choose Views</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-64 overflow-y-auto border p-3 rounded-md">
                {lookups.viewTypes.map((v) => (
                  <label key={v.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={(payload.views || []).includes(v.id)}
                      onCheckedChange={() => toggleAssoc("views", v.id)}
                    />
                    <span className="text-sm">{v.name}</span>
                  </label>
                ))}
              </div>
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
                  <div className="col-span-6 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={np.lat ?? ""}
                        onChange={(e) =>
                          updateNearbyPoint(
                            idx,
                            "lat",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        placeholder="e.g., 25.2048"
                      />
                    </div>

                    <div>
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={np.long ?? ""}
                        onChange={(e) =>
                          updateNearbyPoint(
                            idx,
                            "long",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        placeholder="e.g., 55.2708"
                      />
                    </div>
                  </div>
     
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
                  <input className="col-span-1 border p-1" value={cu.progress_percent} onChange={(e) => updateConstructionUpdate(idx, "progress_percent", e.target.value)} placeholder="%" />
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

            <div className="border p-3 rounded space-y-1">
              <p><strong>Title:</strong> {payload.title}</p>
              <p><strong>Developer:</strong> {lookups.developers.find(d=>d.id===payload.developer_id)?.name || "-"}</p>
              <p><strong>Community:</strong> {lookups.communities.find(c=>c.id===payload.community_id)?.name || "-"}</p>
              <p><strong>Type:</strong> {lookups.propertyTypes.find(t=>t.id===payload.property_type_id)?.name || "-"}</p>
              <p><strong>Status:</strong> {lookups.statusTypes.find(s=>s.id===payload.status_id)?.name || "-"}</p>
              <p><strong>Starting Price:</strong> {payload.starting_price || "-"}</p>
              <p><strong>Existing Images:</strong> {payload.existingImages.length}</p>
              <p><strong>New Images:</strong> {(payload.imageFiles || []).length} files</p>
              <p><strong>Existing Documents:</strong> {payload.existingDocuments.length}</p>
              <p><strong>New Documents:</strong> {(payload.documentFiles || []).length} files</p>
              <p><strong>Existing Floor Plans:</strong> {payload.existingFloorPlans.length}</p>
              <p><strong>New Floor Plans:</strong> {(payload.floorPlanFiles || []).length} files</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
              <Button onClick={handleFinalSubmit} disabled={loading}>
                {loading ? "Saving..." : (isEdit ? "Update" : "Create")}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Step>
      </Stepper>
    </div>
  );
}