//api/properties/[id]/documents/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const { id: propertyId } = await params; // ← AWAIT params

    const { document_type_id, title, file_url, sort_order } = await req.json();

    if (!file_url) {
      return NextResponse.json({ error: "file_url is required" }, { status: 400 });
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

    const client = isSuperAdmin ? supabaseAdmin : supabase;

    // Insert document
    const { data, error } = await client
      .from("property_documents")
      .insert({
        property_id: propertyId,
        document_type_id,
        title,
        file_url,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err) {
    console.error("[POST documents]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}