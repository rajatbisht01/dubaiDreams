// app/api/properties/[id]/construction-updates/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, context) {
  try {
    const supabase = await supabaseServer();
    
    // ✅ FIXED: Properly await params
    const { params } = await context;
    const propertyId = params.id;

    const { update_text, progress_percent, update_date } = await req.json();

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
      .from("construction_updates")
      .insert({
        property_id: propertyId,
        update_text,
        progress_percent,
        update_date,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST construction-updates] Insert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err) {
    console.error("[POST construction-updates]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}