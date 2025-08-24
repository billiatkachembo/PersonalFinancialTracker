import { currencies as baseCurrencies } from './currencies';

export const extendedCurrencies = {
  ...baseCurrencies,
  // Additional African currencies
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  GHS: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  ETB: { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  MAD: { code: "MAD", symbol: "DH", name: "Moroccan Dirham" },
  EGP: { code: "EGP", symbol: "£E", name: "Egyptian Pound" },
  
  // Major global currencies
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  MXN: { code: "MXN", symbol: "$", name: "Mexican Peso" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone" },
  RUB: { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  
  // Middle East currencies
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  QAR: { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  
  // Other regional currencies
  THB: { code: "THB", symbol: "฿", name: "Thai Baht" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" }
};

export type ExtendedCurrencyCode = keyof typeof extendedCurrencies;
