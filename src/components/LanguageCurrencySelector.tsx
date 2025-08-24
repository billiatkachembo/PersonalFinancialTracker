import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { Language } from '@/lib/translations';

export const LanguageCurrencySelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            <Select
              value={language}
              onValueChange={(value: Language) => setLanguage(value)}
              aria-label={t('language')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ny">Chinyanja</SelectItem>
                <SelectItem value="bem">Ichibemba</SelectItem>
                <SelectItem value="loz">Silozi</SelectItem>
                <SelectItem value="to">Chitonga</SelectItem>
                <SelectItem value="kaonde">Chikaonde</SelectItem>
                <SelectItem value="luvale">Chiluvale</SelectItem>
                <SelectItem value="lunda">Chilunda</SelectItem>
                <SelectItem value="swahili">Kiswahili</SelectItem>
                <SelectItem value="chewa">Chichewa</SelectItem>
                <SelectItem value="zh">Chinese (简体中文)</SelectItem>
                <SelectItem value="ja">Japanese (日本語)</SelectItem>
                <SelectItem value="ar">Arabic (العربية)</SelectItem>
                <SelectItem value="pt">Portuguese (Português)</SelectItem>
                <SelectItem value="de">German (Deutsch)</SelectItem>
                <SelectItem value="fr">French (Français)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as never)}
              aria-label={t('currency')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('currency')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, data]) => (
                  <SelectItem key={code} value={code}>
                    {data.symbol} {data.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};