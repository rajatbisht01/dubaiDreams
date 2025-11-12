import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // full privileges
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "ID is required" }), { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("properties")
      .update({
        deleted: true,
        deleted_at: new Date(),
      })
      .eq("id", id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[API/DELETE] Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
