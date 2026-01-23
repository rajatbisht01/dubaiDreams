import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Only return data NOT in the main property list
export async function GET(request, { params }) {
  try {
    // Unwrap params for Next.js 15
    const { id } = await params;
    
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        property_documents(
          id,
          document_type_id,
          title,
          file_url,
          sort_order,
          document_types(id, name)
        ),
        floor_plans(
          id,
          title,
          size,
          pdf_url
        ),
        construction_updates(
          id,
          update_text,
          progress_percent,
          update_date
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching property details:", error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}