import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const id = params.id;
    const body = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // get property owner
    const { data: prop } = await supabase
      .from("properties")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin = profile?.role === "admin" && prop.created_by === user.id;

    if (!isSuperAdmin && !isOwnerAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // choose client
    const client = isSuperAdmin ? supabaseAdmin : supabase;

    // extract relational arrays
    const { amenities, features, views, ...propertyData } = body;

    // update base row
    const { data: updated, error } = await client
      .from("properties")
      .update(propertyData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // update m2m
    const tasks = [];

    if (amenities) {
      tasks.push(client.from("property_amenities").delete().eq("property_id", id));
      if (amenities.length) {
        tasks.push(
          client.from("property_amenities").insert(
            amenities.map(a => ({ property_id: id, amenity_id: a }))
          )
        );
      }
    }

    if (features) {
      tasks.push(client.from("property_features").delete().eq("property_id", id));
      if (features.length) {
        tasks.push(
          client.from("property_features").insert(
            features.map(f => ({ property_id: id, feature_id: f }))
          )
        );
      }
    }

    if (views) {
      tasks.push(client.from("property_views").delete().eq("property_id", id));
      if (views.length) {
        tasks.push(
          client.from("property_views").insert(
            views.map(v => ({ property_id: id, view_type_id: v }))
          )
        );
      }
    }

    if (tasks.length) await Promise.all(tasks);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/properties/[id]]", err);
    return NextResponse.json({ error: err.message || "failed" }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  try {
    const supabase = await supabaseServer();
    const id = params.id;

    // auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );

    // profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // property info
    const { data: prop } = await supabase
      .from("properties")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!prop) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const isSuperAdmin = profile?.role === "superAdmin";
    const isOwnerAdmin =
      profile?.role === "admin" && prop.created_by === user.id;

    if (!isSuperAdmin && !isOwnerAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // choose supabase client
    const client = isSuperAdmin ? supabaseAdmin : supabase;

    // delete children (m2m tables)
    await client.from("property_amenities").delete().eq("property_id", id);
    await client.from("property_features").delete().eq("property_id", id);
    await client.from("property_views").delete().eq("property_id", id);

    // delete property
    const { error } = await client.from("properties").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/properties/[id]]", err);
    return NextResponse.json(
      { success: false, error: err.message || "failed" },
      { status: 500 }
    );
  }
}

