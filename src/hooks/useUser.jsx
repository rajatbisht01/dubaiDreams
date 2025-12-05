"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export const useUser = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase =  supabaseClient();
  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", authData.user.id)
        .single();

      setProfile(profileData || null);
      setLoading(false);
    };

    load();
  }, []);

  return { profile, loading };
};
