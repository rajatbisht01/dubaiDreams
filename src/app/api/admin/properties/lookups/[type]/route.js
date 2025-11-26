// app/api/admin/lookups/[type]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Map endpoint names to table names
const TABLE_MAP = {
  "property-types": "property_types",
  "property-status": "property_status_types",
  "communities": "communities",
  "developers": "developers",
  "amenities": "amenities",
  "features": "features",
  "view-types": "view_types",
  "nearby-categories": "nearby_categories",
  "document-types": "document_types",
};

export async function GET(request, { params }) {
  try {
    const { type } = params;
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: "Invalid lookup type" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[GET /api/admin/lookups]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { type } = params;
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: "Invalid lookup type" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, logo_url } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // Check for duplicates
    const { data: existing } = await supabase
      .from(tableName)
      .select("id")
      .eq("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Item with this name already exists" },
        { status: 400 }
      );
    }

    // Insert
    const insertData = { name };
    if (logo_url && tableName === "developers") {
      insertData.logo_url = logo_url;
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/admin/lookups]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// app/api/admin/lookups/[type]/[id]/route.ts
export async function PUT(request, { params }) {
  try {
    const { type, id } = params;
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: "Invalid lookup type" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, logo_url } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // Check for duplicates (excluding current item)
    const { data: existing } = await supabase
      .from(tableName)
      .select("id")
      .eq("name", name)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Item with this name already exists" },
        { status: 400 }
      );
    }

    // Update
    const updateData = { name };
    if (tableName === "developers") {
      updateData.logo_url = logo_url || null;
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/admin/lookups]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { type, id } = params;
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: "Invalid lookup type" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);

    if (error) {
      // Check if it's a foreign key constraint error
      if (error.code === "23503") {
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot delete: This item is being used by properties" 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/lookups]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}