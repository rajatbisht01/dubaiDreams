import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

export async function PUT(request, { params }) {
  try {
    const { type, id } = params;
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Invalid lookup type" }, { status: 400 });
    }

    const body = await request.json();
    const { name, logo_url } = body;

    const supabase = await supabaseServer();

    const updateData = { name };
    if (tableName === "developers") updateData.logo_url = logo_url || null;

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { type, id } = params;
    const tableName = TABLE_MAP[type];

    const supabase = await supabaseServer();

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);

    if (error?.code === "23503") {
      return NextResponse.json(
        { success: false, error: "Cannot delete: This item is used by a property" },
        { status: 400 }
      );
    }

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
