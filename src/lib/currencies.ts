export const currencies = {
  ZMW: { code: "ZMW", symbol: "ZMW", name: "Zambian Kwacha" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand" },
  BWP: { code: "BWP", symbol: "P", name: "Botswana Pula" },
  NAD: { code: "NAD", symbol: "N$", name: "Namibian Dollar" },
  MWK: { code: "MWK", symbol: "MK", name: "Malawian Kwacha" },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" }
};

export type CurrencyCode = keyof typeof currencies;