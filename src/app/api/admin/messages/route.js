import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {

    const supabase = await supabaseServer();

    const {data, error} = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', {ascending: false});

        if (error){
            console.error("[GET /api/admin/messages] error:", error);
            return new Response(JSON.stringify({error: error.message}), {status: 500});
        }
    return new Response(JSON.stringify(data),{status:200})    
}