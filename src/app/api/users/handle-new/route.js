// src/app/api/users/handle-new/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  console.log("📩 [handle-new] Incoming request...");

  try {
    const supabase = supabaseAdmin;
    const body = await req.json();

    console.log("🧩 [handle-new] Request body:", body);

    const { id, email, name } = body;

    if (!id || !email) {
      console.error("❌ [handle-new] Missing id or email", { id, email });
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }

    console.log("🪣 [handle-new] Upserting profile to Supabase...", { id, email, name });

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id,
        email,
        name: name || "",
        role: "admin",
        created_at: new Date().toISOString(),
      })
      .select();

    console.log("🧾 [handle-new] Supabase upsert result:", { data, error });

    if (error) {
      console.error("❌ [handle-new] Supabase error:", error);
      throw error;
    }

    console.log("✅ [handle-new] Profile saved successfully:", data);

    return NextResponse.json({ status: "ok", data });
  } catch (err) {
    console.error("🔥 [handle-new] Fatal error:", err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
