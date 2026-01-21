"use client";

import { usePropertyStore } from '@/store/propertyStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { DollarSign, Check } from 'lucide-react';

export default function CurrencySelector() {
  const currency = usePropertyStore(state => state.currency);
  const currencyLoading = usePropertyStore(state => state.currencyLoading);
  const setCurrency = usePropertyStore(state => state.setCurrency);

  const currencies = [
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ];

  if (currencyLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <DollarSign className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-accent transition-colors min-w-[100px]"
        >
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{curr.symbol}</span>
              <div>
                <div className="font-medium">{curr.code}</div>
                <div className="text-xs text-muted-foreground">{curr.name}</div>
              </div>
            </div>
            {currency === curr.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}