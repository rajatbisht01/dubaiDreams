import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    const selectQuery = `
      *,
      developers:developer_id(*),
      communities:community_id(*),
      property_types:property_type_id(*),
      property_status_types:status_id(*),
      property_images(id, image_url, is_featured, sort_order),
      property_amenities(amenity:amenity_id(*)),
      property_features(feature:feature_id(*)),
      property_views(view:view_type_id(*)),
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

    let query = supabase
      .from("properties")
      .select(selectQuery)
      .order("created_at", { ascending: false });

    if (profile.role === "admin") {
      query = query.eq("created_by", user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err) {
    console.error("[GET /api/admin/properties]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------------------- POST (create property + relational) ---------------------- */
export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = await supabaseServer();

    console.log("[POST Property] Received data:", {
      amenities: body.amenities,
      features: body.features,
      views: body.views,
      nearby_points_count: body.nearby_points?.length,
      construction_updates_count: body.construction_updates?.length
    });

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

    // Extract relational fields
    const { 
      amenities = [], 
      features = [], 
      views = [],
      nearby_points = [],
      construction_updates = [],
      ...propertyData 
    } = body;

    // Insert main property
    const { data: property, error: insertErr } = await supabase
      .from("properties")
      .insert({
        ...propertyData,
        created_by: user.id
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[POST Property] Insert error:", insertErr);
      throw insertErr;
    }

    const propertyId = property.id;
    console.log("[POST Property] Created property:", propertyId);

    // Insert amenities
    if (amenities.length > 0) {
      console.log("[POST Property] Inserting amenities:", amenities);
      const amenitiesData = amenities.map(a => ({
        property_id: propertyId,
        amenity_id: a
      }));

      const { error: amenErr } = await supabase
        .from("property_amenities")
        .insert(amenitiesData);

      if (amenErr) {
        console.error("[POST Property] Amenities error:", amenErr);
        throw amenErr;
      }
    }

    // Insert features
    if (features.length > 0) {
      console.log("[POST Property] Inserting features:", features);
      const { error: featErr } = await supabase
        .from("property_features")
        .insert(features.map(f => ({
          property_id: propertyId,
          feature_id: f
        })));

      if (featErr) {
        console.error("[POST Property] Features error:", featErr);
        throw featErr;
      }
    }

    // Insert views
    if (views.length > 0) {
      console.log("[POST Property] Inserting views:", views);
      const { error: viewErr } = await supabase
        .from("property_views")
        .insert(views.map(v => ({
          property_id: propertyId,
          view_type_id: v
        })));

      if (viewErr) {
        console.error("[POST Property] Views error:", viewErr);
        throw viewErr;
      }
    }

    // Insert nearby points
    const validNearbyPoints = nearby_points.filter(np => np.name && np.category_id);
    if (validNearbyPoints.length > 0) {
      console.log("[POST Property] Inserting nearby points:", validNearbyPoints);
      const { error: nearbyErr } = await supabase
        .from("property_nearby_points")
        .insert(validNearbyPoints.map(np => ({
          property_id: propertyId,
          category_id: np.category_id,
          name: np.name,
          distance_in_km: np.distance_in_km || null,
          distance_in_minutes: np.distance_in_minutes || null,
          lat: np.lat || null,
          lang: np.lang || null
        })));

      if (nearbyErr) {
        console.error("[POST Property] Nearby points error:", nearbyErr);
        throw nearbyErr;
      }
    }

    // Insert construction updates
    const validUpdates = construction_updates.filter(cu => cu.update_text);
    if (validUpdates.length > 0) {
      console.log("[POST Property] Inserting construction updates:", validUpdates);
      const { error: updateErr } = await supabase
        .from("construction_updates")
        .insert(validUpdates.map(cu => ({
          property_id: propertyId,
          update_text: cu.update_text,
          progress_percent: cu.progress_percent || null,
          update_date: cu.update_date || null
        })));

      if (updateErr) {
        console.error("[POST Property] Construction updates error:", updateErr);
        throw updateErr;
      }
    }

    console.log("[POST Property] All inserts completed successfully");
    return NextResponse.json(property);

  } catch (err) {
    console.error("[POST /api/admin/properties]", err);
    return NextResponse.json({ error: err.message || "Failed to create property" }, { status: 500 });
  }
}