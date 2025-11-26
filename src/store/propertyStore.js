import { create } from "zustand";

export const usePropertyStore = create((set, get) => ({
  /* ---------------------- STATE ---------------------- */
  selectedProperty: null,
  allProperties: [],
  featuredProperties: [],
  carouselProperties: [],

  totalProperties: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,

  propertyTypes: [],
  categories: [],
  communities: [],
  developers: [],
  amenities: [],

  /* ---------------------- SETTERS ---------------------- */
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setPage: (page) => set({ page }),

  /* ---------------------- FETCH SINGLE PROPERTY ---------------------- */
  fetchPropertyById: async (id) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      set({ selectedProperty: data || null });
      return data;
    } catch (err) {
      console.error("[PropertyStore] fetchPropertyById error:", err);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ---------------------- FETCH FILTER METADATA ---------------------- */
  fetchFilters: async () => {
    try {
      const res = await fetch("/api/filters");
      const data = await res.json();

      set({
        propertyTypes: data.propertyTypes || [],
        categories: data.statusTypes || [],
        communities: data.communities || [],
        developers: data.developers || [],
        amenities: data.amenities || [],
      });

      return data;
    } catch (err) {
      console.error("[PropertyStore] fetchFilters error:", err);
      return null;
    }
  },

  /* ---------------------- FETCH PROPERTIES ---------------------- */
  fetchProperties: async (filters = {}) => {
    set({ loading: true });
    try {
      const state = get();

      const url = new URL("/api/properties", window.location.origin);
      url.searchParams.set("page", state.page.toString());
      url.searchParams.set("limit", state.limit.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "any") {
          url.searchParams.set(key, value.toString());
        }
      });

      const res = await fetch(url.toString());
      const data = await res.json();

      set({
        allProperties: data?.data?.items || [],
        totalProperties: data?.data?.meta?.total || 0,
        totalPages: data?.data?.meta?.totalPages || 1,
      });

      return data?.data?.items || [];
    } catch (err) {
      console.error("[PropertyStore] fetchProperties error:", err);
      return [];
    } finally {
      set({ loading: false });
    }
  },

  /* ---------------------- FETCH FEATURED ---------------------- */
  fetchFeaturedProperties: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/properties?isFeatured=true&limit=20");
      const data = await res.json();
      set({ featuredProperties: data?.data?.items || [] });
      return data?.data?.items || [];
    } catch (err) {
      console.error("[PropertyStore] fetchFeaturedProperties error:", err);
      return [];
    } finally {
      set({ loading: false });
    }
  },

  /* ---------------------- FETCH CAROUSEL ---------------------- */
  fetchCarouselProperties: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/properties?sortBy=created_at&sortDir=desc&limit=5");
      const data = await res.json();
      set({ carouselProperties: data?.data?.items || [] });
      return data?.data?.items || [];
    } catch (err) {
      console.error("[PropertyStore] fetchCarouselProperties error:", err);
      return [];
    } finally {
      set({ loading: false });
    }
  },
}));