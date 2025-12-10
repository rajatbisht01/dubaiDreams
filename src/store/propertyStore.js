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

  /* ---------------------- FETCH FILTERS WITH LOCALSTORAGE CACHE ---------------------- */
fetchFilters: async () => {
  // Try reading from localStorage first
  const cached = localStorage.getItem("filtersMeta");

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      set({
        propertyTypes: parsed.propertyTypes || [],
        categories: parsed.categories || [],
        communities: parsed.communities || [],
        developers: parsed.developers || [],
        amenities: parsed.amenities || [],
      });
    } catch {}
  }

  // Fetch fresh data in background
  try {
    const res = await fetch("/api/filters");
    const data = await res.json();

    const filtersMeta = {
      propertyTypes: data.propertyTypes || [],
      categories: data.statusTypes || [],
      communities: data.communities || [],
      developers: data.developers || [],
      amenities: data.amenities || [],
    };

    // Save to Zustand
    set(filtersMeta);

    // Save to localStorage for fast next loads
    localStorage.setItem("filtersMeta", JSON.stringify(filtersMeta));

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
      const res = await fetch("/api/properties?page=1&isFeatured=true&limit=12");
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

 /* ---------------------- FETCH CAROUSEL WITH LOCALSTORAGE CACHE ---------------------- */
fetchCarouselProperties: async () => {
  const local = localStorage.getItem("carouselProperties");

  // If cached → load instantly (no flicker)
  if (local) {
    try {
      const parsed = JSON.parse(local);
      set({ carouselProperties: parsed });
    } catch {}
  }

  // Fetch latest from API (background fetch)
  set({ loading: true });
  try {
    const res = await fetch(
      "/api/properties?page=1&isFeatured=true&sortBy=created_at&sortDir=desc&limit=5"
    );
    const data = await res.json();

    const items = data?.data?.items || [];

    // Save to zustand
    set({ carouselProperties: items });

    // Update localStorage
    localStorage.setItem("carouselProperties", JSON.stringify(items));

    return items;
  } catch (err) {
    console.error("[PropertyStore] fetchCarouselProperties error:", err);
    return [];
  } finally {
    set({ loading: false });
  }
},

}));