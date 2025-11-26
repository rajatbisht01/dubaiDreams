// app/api/properties/[id]/images/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, context) {
  try {
    const supabase = await supabaseServer();
    
    // ✅ FIXED: Await params before accessing
    const { params } = await context;
    const propertyId = params.id;

    const { image_url, is_featured, sort_order } = await req.json();

    if (!image_url) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 });
    }

    // --- Auth ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // User role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Property ownership
    const { data: property } = await supabase
      .from("properties")
      .select("created_by")
      .eq("id", propertyId)
      .single();

    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin = profile?.role === "admin" && property.created_by === user.id;

    if (!isSuperAdmin && !isOwnerAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // ✅ ALWAYS use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url,
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST images] Insert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err) {
    console.error("[POST images]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}