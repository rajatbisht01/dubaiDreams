import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/* ---------------------- GET (list properties) ---------------------- */
export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile)
      return NextResponse.json({ error: "No profile found" }, { status: 404 });

    //
    // 🔥 Corrected, valid relation-select string
    //
    const selectQuery = `
      *,
      developers:developer_id(*),
      communities:community_id(*),
      property_types:property_type_id(*),
      property_status_types:status_id(*),

      property_images(id, image_url, is_featured, sort_order),

      property_amenities(
        amenity:amenity_id(*)
      ),

      property_features(
        feature:feature_id(*)
      ),

      property_views(
        view:view_type_id(*)
      ),

      floor_plans(*),
      payment_plans(*),

      property_documents(
        id, title, file_url, sort_order,
        document_types:document_type_id(name)
      ),

      property_nearby_points(
        *,
        nearby_categories:category_id(name)
      ),

      property_media(*),

      construction_updates(
        *,
        construction_update_images(*)
      )
    `;

    //
    // Base query
    //
    let query = supabase
      .from("properties")
      .select(selectQuery)
      .order("created_at", { ascending: false });

    //
    // Restrict admin to their own created properties
    //
    if (profile.role === "admin") {
      query = query.eq("created_by", user.id);
    }

    //
    // Fetch
    //
    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err) {
    console.error("[GET /api/properties]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



/* ---------------------- POST (create property + relational) ---------------------- */
export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "superAdmin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* Extract relational fields */
    const { amenities = [], features = [], views = [], ...propertyData } = body;

    /* Insert main property */
    const { data: property, error: insertErr } = await supabase
      .from("properties")
      .insert({
        ...propertyData,
        created_by: user.id
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    const propertyId = property.id;

    /* Insert amenities */
    if (amenities.length > 0) {
      const bulk = amenities.map(a => ({
        property_id: propertyId,
        amenity_id: a
      }));

      const { error } = await supabase
        .from("property_amenities")
        .insert(bulk);

      if (error) throw error;
    }

    /* Insert features */
    if (features.length > 0) {
      const bulk = features.map(f => ({
        property_id: propertyId,
        feature_id: f
      }));

      const { error } = await supabase
        .from("property_features")
        .insert(bulk);

      if (error) throw error;
    }

    /* Insert views */
    if (views.length > 0) {
      const bulk = views.map(v => ({
        property_id: propertyId,
        view_type_id: v
      }));

      const { error } = await supabase
        .from("property_views")
        .insert(bulk);

      if (error) throw error;
    }

    return NextResponse.json(property);

  } catch (err) {
    console.error("[POST /api/properties]", err);
    return NextResponse.json({ error: err.message || "Failed to create property" }, { status: 500 });
  }
}
