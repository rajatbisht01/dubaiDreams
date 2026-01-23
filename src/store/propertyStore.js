import { create } from "zustand";

// Fixed exchange rate (you can also fetch from an API)
const AED_TO_USD = 0.27; // 1 AED = 0.27 USD

export const usePropertyStore = create((set, get) => ({
  /* ---------------------- STATE ---------------------- */
  selectedProperty: null,
  properties: [], // ADD THIS - main cache for all properties
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

  /* ---------------------- CURRENCY STATE ---------------------- */
  currency: 'AED',
  currencyLoading: true,
  exchangeRate: AED_TO_USD,

  /* ---------------------- SETTERS ---------------------- */
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setPage: (page) => set({ page }),

  /* ---------------------- CURRENCY FUNCTIONS ---------------------- */
  initializeCurrency: async () => {
    if (typeof window === 'undefined') {
      set({ currencyLoading: false });
      return;
    }

    const savedCurrency = localStorage.getItem('preferred_currency');
    
    if (savedCurrency) {
      set({ currency: savedCurrency, currencyLoading: false });
      return;
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const detectedCurrency = data.country_code === 'AE' ? 'AED' : 'USD';
      set({ currency: detectedCurrency });
      localStorage.setItem('preferred_currency', detectedCurrency);
    } catch (err) {
      console.error('Location detection failed:', err);
      set({ currency: 'AED' });
    } finally {
      set({ currencyLoading: false });
    }
  },

  toggleCurrency: () => {
    const currentCurrency = get().currency;
    const newCurrency = currentCurrency === 'AED' ? 'USD' : 'AED';
    set({ currency: newCurrency });
    localStorage.setItem('preferred_currency', newCurrency);
  },

  formatPrice: (priceInAED) => {
    const { currency, exchangeRate } = get();
    
    if (!priceInAED || priceInAED === 0) return 'POA';
    
    let price = priceInAED;
    let symbol = 'AED';
    
    if (currency === 'USD') {
      price = priceInAED * exchangeRate;
      symbol = 'USD';
    }
    
    if (price >= 1000000) {
      return `${symbol} ${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return `${symbol} ${(price / 1000).toFixed(0)}K`;
    }
    return `${symbol} ${price.toLocaleString()}`;
  },

  formatPriceRange: (range) => {
    const { formatPrice } = get();
    
    if (!range) return null;
    
    if (typeof range === 'string' && range.includes('-')) {
      const parts = range.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          return `${formatPrice(min)} - ${formatPrice(max)}`;
        }
      }
      return range;
    }
    
    if (typeof range === 'number') {
      return formatPrice(range);
    }
    
    return range;
  },

  convertPrice: (priceInAED) => {
    const { currency, exchangeRate } = get();
    if (!priceInAED) return 0;
    return currency === 'USD' ? priceInAED * exchangeRate : priceInAED;
  },

  fetchExchangeRate: async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
      const data = await res.json();
      set({ exchangeRate: data.rates.USD || AED_TO_USD });
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
    }
  },

  /* ---------------------- FETCH SINGLE PROPERTY ---------------------- */
  fetchPropertyById: async (id) => {
    // Check if property is already in cache
    const state = get();
    const cached = state.properties.find(p => p.id === id);
    
    if (cached) {
      console.log('✅ Property found in cache');
      set({ selectedProperty: cached });
      return cached;
    }

    // If not cached, fetch from API
    console.log('📡 Fetching property from API...');
    set({ loading: true });
    try {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      
      if (data) {
        // Add to cache
        set({ 
          selectedProperty: data,
          properties: [...state.properties, data] // Add to cache
        });
      }
      
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

      set(filtersMeta);
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

      const items = data?.data?.items || [];

      // Update both properties cache AND allProperties
      set({
        properties: items, // Main cache
        allProperties: items, // Display list
        totalProperties: data?.data?.meta?.total || 0,
        totalPages: data?.data?.meta?.totalPages || 1,
      });

      return items;
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
      const items = data?.data?.items || [];
      
      // Merge into properties cache
      const state = get();
      const existingIds = new Set(state.properties.map(p => p.id));
      const newItems = items.filter(item => !existingIds.has(item.id));
      
      set({ 
        featuredProperties: items,
        properties: [...state.properties, ...newItems] // Add to cache
      });
      
      return items;
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

    if (local) {
      try {
        const parsed = JSON.parse(local);
        set({ carouselProperties: parsed });
      } catch {}
    }

    set({ loading: true });
    try {
      const res = await fetch(
        "/api/properties?page=1&isFeatured=true&sortBy=created_at&sortDir=desc&limit=5"
      );
      const data = await res.json();

      const items = data?.data?.items || [];

      // Merge into properties cache
      const state = get();
      const existingIds = new Set(state.properties.map(p => p.id));
      const newItems = items.filter(item => !existingIds.has(item.id));

      set({ 
        carouselProperties: items,
        properties: [...state.properties, ...newItems] // Add to cache
      });

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