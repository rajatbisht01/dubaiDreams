"use client";

import { useEffect } from 'react';
import { usePropertyStore } from '@/store/propertyStore';

// This component initializes currency on app load
export default function CurrencyInitializer() {
  const initializeCurrency = usePropertyStore((state) => state.initializeCurrency);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined' && initializeCurrency) {
      initializeCurrency();
    }
  }, [initializeCurrency]);

  return null; // This component renders nothing
}