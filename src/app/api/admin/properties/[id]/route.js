import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET single property with all relations
export async function GET(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const id = params.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch property with all related data
    const { data: property, error } = await supabase
      .from("properties")
      .select(`
        *,
        property_amenities(amenity_id),
        property_features(feature_id),
        property_views(view_type_id),
        property_images(id, image_url, is_featured, sort_order),
        property_documents(
          id, 
          title, 
          file_url, 
          document_type_id, 
          sort_order,
          document_types(id, name)
        ),
        floor_plans(id, title, size, pdf_url),
        property_nearby_points(
          id, 
          category_id, 
          name, 
          distance_in_km, 
          distance_in_minutes, 
          lat, 
          long
        ),
        construction_updates(
          id, 
          update_text, 
          progress_percent, 
          update_date
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("[GET Property] Supabase error:", error);
      throw error;
    }
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    console.log("[GET Property] Fetched property:", {
      id: property.id,
      amenities_count: property.property_amenities?.length,
      features_count: property.property_features?.length,
      views_count: property.property_views?.length,
      nearby_count: property.property_nearby_points?.length,
      updates_count: property.construction_updates?.length
    });

    return NextResponse.json(property);
  } catch (err) {
    console.error("[GET /api/admin/properties/[id]]", err);
    return NextResponse.json({ error: err.message || "failed" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const id = params.id;
    const body = await req.json();

    console.log("[PUT Property] Received data:", {
      id,
      amenities: body.amenities,
      features: body.features,
      views: body.views,
      nearby_points_count: body.nearby_points?.length,
      construction_updates_count: body.construction_updates?.length
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // get property owner
    const { data: prop } = await supabase
      .from("properties")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;

    if (!isSuperAdmin && !isOwnerAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // choose client
    const client = isSuperAdmin ? supabaseAdmin : supabase;

    // extract relational arrays
    const { amenities, features, views, nearby_points, construction_updates, ...propertyData } = body;

    // update base row
    const { data: updated, error: updateError } = await client
      .from("properties")
      .update(propertyData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[PUT Property] Update error:", updateError);
      throw updateError;
    }

    // Update many-to-many relationships SEQUENTIALLY to avoid race conditions
    
    // 1. Amenities
    if (Array.isArray(amenities)) {
      console.log("[PUT Property] Updating amenities:", amenities);
      
      // Delete existing
      const { error: delAmenError } = await client
        .from("property_amenities")
        .delete()
        .eq("property_id", id);
      
      if (delAmenError) {
        console.error("[PUT Property] Delete amenities error:", delAmenError);
        throw delAmenError;
      }

      // Insert new
      if (amenities.length > 0) {
        const amenitiesData = amenities.map(a => ({ 
          property_id: id, 
          amenity_id: a 
        }));
        
        console.log("[PUT Property] Inserting amenities:", amenitiesData);
        
        const { error: insAmenError } = await client
          .from("property_amenities")
          .insert(amenitiesData);
        
        if (insAmenError) {
          console.error("[PUT Property] Insert amenities error:", insAmenError);
          throw insAmenError;
        }
      }
    }

    // 2. Features
    if (Array.isArray(features)) {
      console.log("[PUT Property] Updating features:", features);
      
      const { error: delFeatError } = await client
        .from("property_features")
        .delete()
        .eq("property_id", id);
      
      if (delFeatError) throw delFeatError;

      if (features.length > 0) {
        const { error: insFeatError } = await client
          .from("property_features")
          .insert(features.map(f => ({ property_id: id, feature_id: f })));
        
        if (insFeatError) throw insFeatError;
      }
    }

    // 3. Views
    if (Array.isArray(views)) {
      console.log("[PUT Property] Updating views:", views);
      
      const { error: delViewError } = await client
        .from("property_views")
        .delete()
        .eq("property_id", id);
      
      if (delViewError) throw delViewError;

      if (views.length > 0) {
        const { error: insViewError } = await client
          .from("property_views")
          .insert(views.map(v => ({ property_id: id, view_type_id: v })));
        
        if (insViewError) throw insViewError;
      }
    }

    // 4. Nearby points
    if (Array.isArray(nearby_points)) {
      console.log("[PUT Property] Updating nearby points:", nearby_points);
      
      const { error: delNearbyError } = await client
        .from("property_nearby_points")
        .delete()
        .eq("property_id", id);
      
      if (delNearbyError) throw delNearbyError;

      const validNearbyPoints = nearby_points.filter(np => np.name && np.category_id);
      
      if (validNearbyPoints.length > 0) {
        const { error: insNearbyError } = await client
          .from("property_nearby_points")
          .insert(
            validNearbyPoints.map(np => ({
              property_id: id,
              category_id: np.category_id,
              name: np.name,
              distance_in_km: np.distance_in_km || null,
              distance_in_minutes: np.distance_in_minutes || null,
              lat: np.lat || null,
              long: np.long || null
            }))
          );
        
        if (insNearbyError) throw insNearbyError;
      }
    }

    // 5. Construction updates
    if (Array.isArray(construction_updates)) {
      console.log("[PUT Property] Updating construction updates:", construction_updates);
      
      const { error: delUpdateError } = await client
        .from("construction_updates")
        .delete()
        .eq("property_id", id);
      
      if (delUpdateError) throw delUpdateError;

      const validUpdates = construction_updates.filter(cu => cu.update_text);
      
      if (validUpdates.length > 0) {
        const { error: insUpdateError } = await client
          .from("construction_updates")
          .insert(
            validUpdates.map(cu => ({
              property_id: id,
              update_text: cu.update_text,
              progress_percent: cu.progress_percent || null,
              update_date: cu.update_date || null
            }))
          );
        
        if (insUpdateError) throw insUpdateError;
      }
    }

    console.log("[PUT Property] Update completed successfully");
    return NextResponse.json(updated);
    
  } catch (err) {
    console.error("[PUT /api/admin/properties/[id]]", err);
    return NextResponse.json({ error: err.message || "failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const id = params.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const { data: prop } = await supabase
      .from("properties")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!prop) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;

    if (!isSuperAdmin && !isOwnerAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const client = isSuperAdmin ? supabaseAdmin : supabase;

    // Delete all related records sequentially
    await client.from("property_amenities").delete().eq("property_id", id);
    await client.from("property_features").delete().eq("property_id", id);
    await client.from("property_views").delete().eq("property_id", id);
    await client.from("property_nearby_points").delete().eq("property_id", id);
    await client.from("construction_updates").delete().eq("property_id", id);
    await client.from("property_images").delete().eq("property_id", id);
    await client.from("property_documents").delete().eq("property_id", id);
    await client.from("floor_plans").delete().eq("property_id", id);

    // delete property
    const { error } = await client.from("properties").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/properties/[id]]", err);
    return NextResponse.json(
      { success: false, error: err.message || "failed" },
      { status: 500 }
    );
  }
}