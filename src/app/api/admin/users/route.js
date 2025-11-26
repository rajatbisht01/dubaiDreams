// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    const supabase = await supabaseServer();

    // Get current user to check if they're superAdmin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is superAdmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "superAdmin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: SuperAdmin access required" },
        { status: 403 }
      );
    }

    // Fetch all users
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// app/api/admin/users/[id]/role/route.ts
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["user", "admin", "superAdmin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // Get current user to check if they're superAdmin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if current user is superAdmin
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "superAdmin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: SuperAdmin access required" },
        { status: 403 }
      );
    }

    // Prevent users from demoting themselves
    if (user.id === id && role !== "superAdmin") {
      return NextResponse.json(
        { success: false, error: "You cannot demote yourself" },
        { status: 400 }
      );
    }

    // Update user role
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/admin/users/role]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}