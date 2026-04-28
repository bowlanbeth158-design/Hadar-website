'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Currency = 'MAD' | 'EUR' | 'USD';

export const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'MAD', label: 'Dirham marocain', symbol: 'MAD' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'USD', label: 'Dollar américain', symbol: '$' },
];

// Approx mid-2026 mock rates — 1 MAD expressed in the target currency.
// Replace with /api/fx when the backend lands; the rest of the app
// only consumes `format(amountMAD, currency)` so the swap is local.
const RATE_FROM_MAD: Record<Currency, number> = {
  MAD: 1,
  EUR: 0.092,
  USD: 0.1,
};

const SYMBOL: Record<Currency, string> = {
  MAD: 'MAD',
  EUR: '€',
  USD: '$',
};

const PLACEHOLDER_AMOUNT: Record<Currency, string> = {
  MAD: '5 000',
  EUR: '500',
  USD: '500',
};

const STORAGE_KEY = 'hadar:currency';
const DEFAULT_CURRENCY: Currency = 'MAD';

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  // Convert a MAD-denominated number to the active currency and
  // return a fully-formatted string with French-style thousand
  // separators ("12 408 MAD", "1 141 €", "1 240 $").
  format: (amountMAD: number) => string;
  // Just the "5 000" / "500" / "500" base for placeholders.
  placeholderAmount: string;
};

const CurrencyContext = createContext<Ctx>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  symbol: SYMBOL[DEFAULT_CURRENCY],
  format: () => '',
  placeholderAmount: PLACEHOLDER_AMOUNT[DEFAULT_CURRENCY],
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

function formatNumber(n: number): string {
  // toLocaleString('fr-FR') uses U+202F (narrow no-break space) as a
  // thousand separator on some browsers — normalise to a regular
  // space so spacing stays consistent in our pill / card layouts.
  return Math.round(n)
    .toLocaleString('fr-FR')
    .replace(/[  ]/g, ' ');
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  // Restore stored preference on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'MAD' || stored === 'EUR' || stored === 'USD') {
        setCurrencyState(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore storage errors
    }
    setCurrencyState(c);
  }, []);

  const value = useMemo<Ctx>(() => {
    const symbol = SYMBOL[currency];
    const placeholderAmount = PLACEHOLDER_AMOUNT[currency];
    const format = (amountMAD: number) => {
      const converted = amountMAD * RATE_FROM_MAD[currency];
      const formatted = formatNumber(converted);
      return currency === 'MAD' ? `${formatted} MAD` : `${formatted} ${symbol}`;
    };
    return { currency, setCurrency, symbol, format, placeholderAmount };
  }, [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
