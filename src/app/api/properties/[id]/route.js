// app/api/properties/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const supabase = await supabaseServer();

    // Optimized query with selective field loading
    const { data, error } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        description,
        starting_price,
        price_range,
        bedrooms,
        bathrooms,
        size_range,
        handover,
        roi,
        service_charge,
        annual_rent,
        estimated_yield,
        market_price_psf,
        rental_price_psf,
        isFeatured,
        property_type_id,
        community_id,
        developer_id,
        status_id,
        
        developers:developer_id ( id, name, logo_url ),
        communities:community_id ( id, name ),
        property_types:property_type_id ( id, name ),
        property_status_types:status_id ( id, name ),
        
        property_images ( id, image_url ),
        
        property_features (
          feature_id,
          features ( id, name )
        ),
        
        property_amenities (
          amenity_id,
          amenities ( id, name )
        ),
        
        property_views (
          view_type_id,
          view_types ( id, name )
        ),
        
        property_nearby_points (
          id,
          name,
          distance_in_km,
          distance_in_minutes,
          nearby_categories ( id, name )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("[GET /api/properties/[id]] Error:", error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Property not found" }, 
        { status: 404 }
      );
    }

    // Return optimized response
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });

  } catch (err) {
    console.error("[GET /api/properties/[id]] Exception:", err);
    return NextResponse.json(
      { error: "Failed to fetch property" }, 
      { status: 500 }
    );
  }
}

// Optional: Add route segment config for optimization
export const dynamic = 'force-dynamic'; // or 'force-static' if properties don't change often
export const revalidate = 60; // Revalidate every 60 seconds