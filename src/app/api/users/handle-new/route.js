// src/app/api/users/handle-new/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();
    const { id, email, full_name } = body;

    if (!id || !email || !full_name) {
      return NextResponse.json(
        { error: "Missing id, email, or full_name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id,
        email,
        full_name,
        role: "user", // default
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ status: "ok", data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
