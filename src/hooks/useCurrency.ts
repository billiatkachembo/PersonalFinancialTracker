import { useState, useEffect } from 'react';
import { extendedCurrencies, ExtendedCurrencyCode } from '@/lib/currencies-extended';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<ExtendedCurrencyCode>(() => {
    const stored = localStorage.getItem('currency');
    return (stored as ExtendedCurrencyCode) || 'ZMW';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatAmount = (amount: number): string => {
    const currencyData = extendedCurrencies[currency];
    return `${currencyData.symbol} ${amount.toFixed(2)}`;
  };

  return { currency, setCurrency, formatAmount, currencies: extendedCurrencies };
};