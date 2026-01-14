import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { searchParams } = new URL(request.url);

    /* ---------------------- Query Params ---------------------- */
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const search = searchParams.get("search")?.trim() || "";
    const community = searchParams.get("community");
    const developer = searchParams.get("developer");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const bedrooms = searchParams.get("bedrooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isFeatured = searchParams.get("isFeatured") === "true";
    const amenitiesParam = searchParams.get("amenities");
    const amenitiesArray = amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : [];

    /* ---------------------- Sorting ---------------------- */
    let sortBy = searchParams.get("sortBy") || "created_at";
    let sortDir = searchParams.get("sortDir") || "desc";
    
    // Validate sort direction
    if (!["asc", "desc"].includes(sortDir)) {
      sortDir = "desc";
    }

    // Validate sort field
    const validSortFields = ["isFeatured", "starting_price", "created_at", "title"];
    if (!validSortFields.includes(sortBy)) {
      sortBy = "created_at";
    }

    /* ---------------------- Pagination ---------------------- */
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* ---------------------- Select Graph ---------------------- */
    const selectQuery = `
      id, title, slug, description, starting_price, created_at, latitude, longitude, isFeatured,
      bedrooms, bathrooms, size_range, price_range, handover, roi,
      developers:developer_id(id, name, logo_url),
      communities:community_id(id, name),
      property_types:property_type_id(id, name),
      property_status_types:status_id(id, name),
      property_images!inner(id, image_url, is_featured, sort_order),
      property_amenities!left(amenity_id),
      nearby_points:property_nearby_points(
    id,
    name,
    lat,
    long,
    distance_in_km,
    distance_in_minutes,
    nearby_categories:category_id(id, name)
  )
    `;

    /* ---------------------- Base Query ---------------------- */
    let query = supabase
      .from("properties")
      .select(selectQuery, { count: "exact" });

    /* ---------------------- Apply Filters ---------------------- */
    
    // Search filter (title or description)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by community ID
    if (community && community !== "all") {
      query = query.eq("community_id", community);
    }

    // Filter by developer ID
    if (developer && developer !== "all") {
      query = query.eq("developer_id", developer);
    }

    // Filter by property type ID
    if (propertyType && propertyType !== "all") {
      query = query.eq("property_type_id", propertyType);
    }

    // Filter by status ID
    if (status && status !== "all") {
      query = query.eq("status_id", status);
    }

    // Filter by bedrooms
    if (bedrooms && bedrooms !== "any") {
      if (bedrooms === "5+") {
        // For 5+ bedrooms, match strings like "5", "6", etc.
        query = query.or("bedrooms.eq.5,bedrooms.eq.6,bedrooms.eq.7,bedrooms.eq.8");
      } else {
        query = query.eq("bedrooms", bedrooms);
      }
    }

    // Price range filters
    if (minPrice) {
      query = query.gte("starting_price", Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte("starting_price", Number(maxPrice));
    }

    // Featured properties
    if (isFeatured) {
      query = query.eq("isFeatured", true);
    }

    /* ---------------------- Amenities Filter ---------------------- */
    // If amenities are selected, we need to filter properties that have ALL selected amenities
    if (amenitiesArray.length > 0) {
      // This approach checks if property has all selected amenities
      // We'll fetch and filter in-memory for complex AND logic
      // Note: For better performance, consider using a stored procedure or aggregate function
    }

    /* ---------------------- Sorting & Pagination ---------------------- */
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDir === "asc" });
    
    // Secondary sort by created_at for consistent ordering
    if (sortBy !== "created_at") {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    query = query.range(from, to);

    /* ---------------------- Execute ---------------------- */
    const { data, count, error } = await query;
    
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Transform data to ensure featured image is first
    let transformedData = (data || []).map(property => {
      if (property.property_images && property.property_images.length > 0) {
        // Sort images: featured first, then by sort_order
        property.property_images.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        });
      }
      return property;
    });

    // Filter by amenities if needed (client-side filtering for AND logic)
    if (amenitiesArray.length > 0) {
      transformedData = transformedData.filter(property => {
        if (!property.property_amenities || property.property_amenities.length === 0) {
          return false;
        }
        const propertyAmenityIds = property.property_amenities.map(pa => pa.amenity_id);
        return amenitiesArray.every(amenityId => propertyAmenityIds.includes(amenityId));
      });
    }

    // Recalculate pagination after amenities filter
    const filteredCount = amenitiesArray.length > 0 ? transformedData.length : count;
    const filteredTotalPages = Math.ceil((filteredCount || 0) / limit);

    return NextResponse.json({
      status: "success",
      data: {
        items: transformedData,
        meta: {
          total: filteredCount || 0,
          page,
          limit,
          totalPages: filteredTotalPages,
        },
      },
    });
  } catch (err) {
    console.error("🚨 GET /api/properties failed:", err);
    return NextResponse.json(
      { 
        status: "error", 
        message: err.message || "Unexpected error",
        data: {
          items: [],
          meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
        }
      },
      { status: 500 }
    );
  }
}