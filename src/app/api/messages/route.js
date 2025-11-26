// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { property_id, name, email, phone, message } = body;
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("user_messages")
      .insert({ property_id, name, email, phone, message })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages] ", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
