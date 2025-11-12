import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Must use Service Role
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const propertyData = JSON.parse(formData.get("property"));
    const files = formData.getAll("files"); // Array of File objects

    // 1️⃣ Insert property without images
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("properties")
      .insert([{
        ...propertyData,
        deleted: false,
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    const propertyId = inserted.id;
    const uploadedUrls = [];

    // 2️⃣ Upload files to Storage
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

    // 3️⃣ Update property with uploaded image URLs
    if (uploadedUrls.length > 0) {
      await supabaseAdmin
        .from("properties")
        .update({ images: uploadedUrls })
        .eq("id", propertyId);
    }

    return new Response(JSON.stringify({ success: true, property: { ...inserted, images: uploadedUrls } }), { status: 200 });

  } catch (err) {
    console.error("[API/ADD] Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
