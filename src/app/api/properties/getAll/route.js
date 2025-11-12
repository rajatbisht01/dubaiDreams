import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

    console.log("data ****************", data )
  if (error) {
    console.error("[API/GET] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
