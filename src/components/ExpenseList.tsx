import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import { Transaction } from './FinancialTracker';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { categories } from '@/lib/categories';

interface ExpenseListProps {
  expenses: Transaction[];
  onDelete: (id: string) => void;
  showActions?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onDelete, 
  showActions = true 
}) => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No expenses recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card 
          key={expense.id} 
          className="border-l-4 border-l-expense shadow-soft hover:shadow-medium transition-smooth"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {expense.category}
                  </Badge>
                  {expense.account && (
                    <Badge variant="outline" className="text-xs">
                      {expense.account}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-foreground">{expense.description}</p>
                <p className="text-sm text-muted-foreground">{expense.date}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-expense">
                  {formatAmount(expense.amount)}
                </div>
                {showActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
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