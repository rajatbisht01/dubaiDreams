"use client";

import { usePropertyStore } from '@/store/propertyStore';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

export default function CurrencyToggle() {
  const currency = usePropertyStore(state => state.currency);
  const currencyLoading = usePropertyStore(state => state.currencyLoading);
  const toggleCurrency = usePropertyStore(state => state.toggleCurrency);

  if (currencyLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <DollarSign className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleCurrency}
      className="gap-2 hover:bg-accent transition-colors"
      title={`Switch to ${currency === 'AED' ? 'USD' : 'AED'}`}
    >
      <DollarSign className="h-4 w-4" />
      <span className="text-sm font-medium">{currency}</span>
      <span className="text-xs text-muted-foreground ml-1">
        ({currency === 'AED' ? 'Dirham' : 'Dollar'})
      </span>
    </Button>
  );
}