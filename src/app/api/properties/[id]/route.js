// app/api/properties/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        developers:developer_id ( id, name, logo_url ),
        communities:community_id ( id, name ),
        property_types:property_type_id ( id, name ),
        property_status_types:status_id ( id, name ),

        property_images(*),
        floor_plans(*),
        property_documents(*),
        property_media(*),

        property_features(
          feature_id,
          features ( id, name )
        ),

        property_amenities(
          amenity_id,
          amenities ( id, name )
        ),

        property_views(
          view_type_id,
          view_types ( id, name )
        ),

        payment_plans(*),

        construction_updates(
          *,
          construction_update_images(*)
        ),

        property_nearby_points(
          *,
          nearby_categories ( id, name )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (err) {
    console.error("[GET /api/properties/[id]]", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


// export async function PUT(req, { params }) {
//   try {
//     const supabase = getServerSupabase();
//     const body = await req.json();
//     const { id } = params;

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     // fetch existing property to check owner
//     const { data: prop, error: propErr } = await supabase
//       .from("properties")
//       .select("created_by")
//       .eq("id", id)
//       .single();

//     if (propErr || !prop) return NextResponse.json({ error: "Property not found" }, { status: 404 });

//     const isSuperAdmin = profile?.role === "superAdmin";
//     const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;

//     if (!isSuperAdmin && !isOwnerAdmin) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // if superAdmin and you want to bypass RLS, use supabaseAdmin
//     const client = isSuperAdmin ? supabaseAdmin : supabase;

//     const { data: updated, error } = await client
//       .from("properties")
//       .update(body)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw error;

//     // update m2m lists if provided
//     const { amenities, features, views } = body;
//     const tasks = [];
//     if (amenities) {
//       tasks.push(client.from("property_amenities").delete().eq("property_id", id));
//       if (amenities.length) tasks.push(client.from("property_amenities").insert(amenities.map(a=>({property_id:id, amenity_id:a}))));
//     }
//     if (features) {
//       tasks.push(client.from("property_features").delete().eq("property_id", id));
//       if (features.length) tasks.push(client.from("property_features").insert(features.map(f=>({property_id:id, feature_id:f}))));
//     }
//     if (views) {
//       tasks.push(client.from("property_views").delete().eq("property_id", id));
//       if (views.length) tasks.push(client.from("property_views").insert(views.map(v=>({property_id:id, view_type_id:v}))));
//     }
//     if (tasks.length) await Promise.all(tasks);

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("[PUT /api/properties/[id]]", err);
//     return NextResponse.json({ error: "failed" }, { status: 500 });
//   }
// }

// export async function DELETE(req, { params }) {
//   try {
//     const supabase = getServerSupabase();
//     const { id } = params;

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     // fetch property owner
//     const { data: prop } = await supabase
//       .from("properties")
//       .select("created_by")
//       .eq("id", id)
//       .single();

//     if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const isSuperAdmin = profile?.role === "superAdmin";
//     const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;

//     if (!isSuperAdmin && !isOwnerAdmin) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // If superAdmin use service role to bypass RLS for delete cascade
//     if (isSuperAdmin) {
//       const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
//       if (error) throw error;
//       return NextResponse.json({ success: true });
//     } else {
//       const { error } = await supabase.from("properties").delete().eq("id", id);
//       if (error) throw error;
//       return NextResponse.json({ success: true });
//     }
//   } catch (err) {
//     console.error("[DELETE /api/properties/[id]]", err);
//     return NextResponse.json({ error: "failed" }, { status: 500 });
//   }
// }
