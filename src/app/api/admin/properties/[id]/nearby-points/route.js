import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const propertyId = params.id;

    const { error } = await supabase
      .from("property_nearby_points")
      .insert({
        property_id: propertyId,
        ...body
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST nearby-points]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}