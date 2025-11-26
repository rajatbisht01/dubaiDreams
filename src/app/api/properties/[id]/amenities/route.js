// app/api/properties/[id]/amenities/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, { params }) {
  const supabase = await supabaseServer();
  const { id: propertyId } = params;
  try {
    const body = await req.json(); // { amenity_id }
    const { amenity_id } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const { data: prop } = await supabase.from("properties").select("created_by").eq("id", propertyId).single();
    if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;
    if (!isSuperAdmin && !isOwnerAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = isSuperAdmin ? supabaseAdmin : supabase;
    const { data, error } = await client.from("property_amenities").insert({
      property_id: propertyId,
      amenity_id
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/properties/[id]/amenities] ", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
