// app/api/admin/users/[id]/role/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { role } = await request.json();

    if (!role || !["user", "admin", "superAdmin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    // 1. Get logged-in user (cookie client)
    const supaUser = await supabaseServer();
    const { data: { user } } = await supaUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check role using admin client
    const { data: me } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (me?.role !== "superAdmin") {
      return NextResponse.json(
        { success: false, error: "Only superAdmin can update roles" },
        { status: 403 }
      );
    }

    // 3. Prevent self demotion
    if (user.id === id && role !== "superAdmin") {
      return NextResponse.json(
        { success: false, error: "You cannot demote yourself" },
        { status: 400 }
      );
    }

    // 4. Update target user using admin client
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/admin/users/[id]/role]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
