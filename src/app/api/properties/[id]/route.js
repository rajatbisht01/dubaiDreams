// app/api/properties/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        developers:developer_id ( id, name, logo_url ),
        communities:community_id ( id, name ),
        property_types:property_type_id ( id, name ),
        property_status_types:status_id ( id, name ),

        property_images(*),
        floor_plans(*),
        property_documents(*, document_types(id, name)),
        property_media(*),

        property_features(
          feature_id,
          features ( id, name )
        ),

        property_amenities(
          amenity_id,
          amenities ( id, name )
        ),

        property_views(
          view_type_id,
          view_types ( id, name )
        ),

        payment_plans(*),

        construction_updates(
          *,
          construction_update_images(*)
        ),

        property_nearby_points(
          *,
          nearby_categories ( id, name )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err) {
    console.error("[GET /api/properties/[id]]", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

