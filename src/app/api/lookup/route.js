// app/api/lookups/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const [
      propertyTypes,
      developers,
      communities,
      amenities,
      features,
      statusTypes,
      viewTypes,
      nearbyCategories,
      documentTypes,
    ] = await Promise.all([
      supabase.from("property_types").select("id, name"),
      supabase.from("developers").select("id, name"),
      supabase.from("communities").select("id, name"),
      supabase.from("amenities").select("id, name"),
      supabase.from("features").select("id, name"),
      supabase.from("property_status_types").select("id, name"),
      supabase.from("view_types").select("id, name"),
      supabase.from("nearby_categories").select("id, name"),
      supabase.from("document_types").select("id, name"),
    ]);

    return NextResponse.json({
      propertyTypes: propertyTypes.data ?? [],
      developers: developers.data ?? [],
      communities: communities.data ?? [],
      amenities: amenities.data ?? [],
      features: features.data ?? [],
      statusTypes: statusTypes.data ?? [],
      viewTypes: viewTypes.data ?? [],
      nearbyCategories: nearbyCategories.data ?? [],
      documentTypes: documentTypes.data ?? [],
    });
  } catch (err) {
    console.error("[GET /api/lookups] ", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
