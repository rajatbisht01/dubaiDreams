import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

export const usePropertyStore = create((set, get) => ({
  selectedProperty: null,
  allProperties: [],
  loading: false,

  // Setters
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setAllProperties: (properties) => set({ allProperties: properties }),

  // Fetch single property by ID
  fetchPropertyById: async (id) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*, agent:profiles(*)")
        .eq("id", id)
        .single();

      if (error) throw error;

      const formatted = {
        ...data,
        images: data.images?.map((url) => ({ url, alt_text: data.title })) ?? [],
      };

      set({ selectedProperty: formatted });
      return formatted;
    } catch (err) {
      console.error("[PropertyStore] Fetch error:", err);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Fetch all properties
  fetchAllProperties: async () => {
    set({ loading: true });
    try {
     const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = data.map((item) => ({
        ...item,
        images: item.images?.map((url) => ({ url, alt_text: item.title })) ?? [],
      }));
       console.log("data from store ****************", data ) 
        console.log("error from store ****************", error ) 
      set({ allProperties: formatted });
      return formatted;
    } catch (err) {
      console.error("[PropertyStore] Fetch all error:", err);
      return [];
    } finally {
      set({ loading: false });
    }
  },
}));
