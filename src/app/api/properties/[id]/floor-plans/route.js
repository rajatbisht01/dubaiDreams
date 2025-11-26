// app/api/properties/[id]/floor-plans/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, context) {
  try {
    const supabase = await supabaseServer();
    const { params } = await context;
    const propertyId = params.id;

    const { title, size, pdf_url } = await req.json();

    if (!pdf_url) {
      return NextResponse.json({ error: "pdf_url is required" }, { status: 400 });
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

    // Insert floor plan
    const { data, error } = await client
      .from("floor_plans")
      .insert({
        property_id: propertyId,
        title,
        size,
        pdf_url,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err) {
    console.error("[POST floor-plans]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}