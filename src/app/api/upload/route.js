// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const fileType = form.get("fileType"); // "image" | "document" | "floorplan"
    
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Determine bucket based on file type
    let bucket = "property-documents"; // default
    if (fileType === "image") {
      bucket = "property-images";
    }

    const filename = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, buffer, { 
        upsert: false,
        contentType: file.type 
      });

    if (uploadErr) {
      console.error("Upload error", uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // FIXED: Correct getPublicUrl syntax
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({ file: publicUrl });
  } catch (err) {
    console.error("[POST /api/upload] ", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}