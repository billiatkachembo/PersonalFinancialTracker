import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { BiCalendar, BiDollar } from 'react-icons/bi';
import { Transaction } from './FinancialTracker';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';

interface IncomeListProps {
  income: Transaction[];
  onDelete: (id: string) => void;
  showActions?: boolean;
}

export const IncomeList: React.FC<IncomeListProps> = ({
  income,
  onDelete,
  showActions = true,
}) => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();

  if (income.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('noIncomeRecorded')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {income.map((entry) => (
        <Card
          key={entry.id}
          className="border-l-4 border-l-income shadow-soft hover:shadow-medium transition-smooth"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {t(entry.category)}
                  </Badge>
                  {entry.account && (
                    <Badge variant="outline" className="text-xs">
                      {entry.account}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-foreground">{entry.description}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <BiCalendar className="inline-block h-4 w-4" />
                  {entry.date}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-income flex items-center gap-1 justify-end">
                 
                  {formatAmount(entry.amount)}
                </div>
                {showActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    aria-label={t('deleteIncome')}
                    title={t('deleteIncome')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
