// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    const supabase = await supabaseServer();

    // Fetch counts in parallel
    const [
      { count: totalProperties },
      { count: totalUsers },
      { count: totalDevelopers },
      { count: totalCommunities },
      { count: totalPropertyTypes },
      { count: totalAmenities },
      { count: totalFeatures },
    ] = await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("developers").select("*", { count: "exact", head: true }),
      supabase.from("communities").select("*", { count: "exact", head: true }),
      supabase.from("property_types").select("*", { count: "exact", head: true }),
      supabase.from("amenities").select("*", { count: "exact", head: true }),
      supabase.from("features").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties: totalProperties || 0,
        totalUsers: totalUsers || 0,
        totalDevelopers: totalDevelopers || 0,
        totalCommunities: totalCommunities || 0,
        totalPropertyTypes: totalPropertyTypes || 0,
        totalAmenities: totalAmenities || 0,
        totalFeatures: totalFeatures || 0,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}