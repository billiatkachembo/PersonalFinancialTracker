import { translations, Language, TranslationKey } from '@/lib/translations';
import { useState, useEffect } from 'react';


export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey, p0?: { total: number; income: number; expenses: number; }): string => {
    return translations[language][key] || translations.en[key];
  };

  return { language, setLanguage, t };
};
