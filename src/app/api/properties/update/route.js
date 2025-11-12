import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Must use Service Role
);

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return new Response(JSON.stringify({ success: false, error: "Property ID is required" }), {
        status: 400,
      });
    }

    const formData = await req.formData();
    const propertyData = JSON.parse(formData.get("property"));
    const files = formData.getAll("files");

    console.log("🟢 [UPDATE] Updating property:", propertyId, propertyData);

    // Remove unwanted fields
    delete propertyData.fts;

    // 1️⃣ Upload new images (if any)
    const uploadedUrls = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${propertyId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("Property_images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabaseAdmin.storage
        .from("Property_images")
        .getPublicUrl(path);

      uploadedUrls.push(publicUrl.publicUrl);
    }

    // 2️⃣ Merge existing + new images
    const existingImages = propertyData.images || [];
    const finalImages = [...existingImages, ...uploadedUrls];

    // 3️⃣ Prepare update object
    const finalUpdates = {
      ...propertyData,
      images: finalImages,
      price: propertyData.price ? parseFloat(propertyData.price) : null,
      area_sqft: propertyData.area_sqft ? parseFloat(propertyData.area_sqft) : null,
      bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
      bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : null,
      updated_at: new Date(),
    };

    // 4️⃣ Update property
    const { data, error } = await supabaseAdmin
      .from("properties")
      .update(finalUpdates)
      .eq("id", propertyId)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ [UPDATE] Property updated successfully:", data);

    return new Response(
      JSON.stringify({ success: true, property: data }),
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ [API/UPDATE] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
