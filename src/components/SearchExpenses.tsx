import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Calendar } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { ExpenseList } from './ExpenseList';
import { IncomeList } from './IncomeList';
import { useCurrency } from '@/hooks/useCurrency';
import { useLanguage } from '@/hooks/useLanguage';

interface SearchExpensesProps {
  expenses: Transaction[];
  income: Transaction[];
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
}

// Helper function to calculate the date cutoff based on a filter period
const getDateCutoff = (filter: string): Date | null => {
  const now = new Date();
  const cutoffDate = new Date(now);

  switch (filter) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return null;
  }
  return cutoffDate;
};

export const SearchExpenses: React.FC<SearchExpensesProps> = ({
  expenses,
  income,
  onDeleteExpense,
  onDeleteIncome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { currency } = useCurrency();
  const { t } = useLanguage();

  const allCategories = useMemo(() => {
    const categories = new Set<string>([
      ...expenses.map((e) => e.category),
      ...income.map((i) => i.category),
    ]);
    // Filter out any empty strings or null values that would break the Select component
    return Array.from(categories).filter(Boolean).sort();
  }, [expenses, income]);

  const { filteredTransactions, filteredExpenses, filteredIncome } = useMemo(() => {
    let allTransactions = [...expenses, ...income];

    // Apply text search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allTransactions = allTransactions.filter((transaction) =>
        transaction.description.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        (transaction.account?.toLowerCase().includes(term) ?? false)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      allTransactions = allTransactions.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      allTransactions = allTransactions.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Apply date filter
    const cutoffDate = getDateCutoff(dateFilter);
    if (cutoffDate) {
      allTransactions = allTransactions.filter(
        (transaction) => new Date(transaction.date) >= cutoffDate
      );
    }

    // Sort transactions by date (most recent first)
    allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Separate filtered transactions into expenses and income
    const expensesList = allTransactions.filter((t) => t.type === 'expense');
    const incomeList = allTransactions.filter((t) => t.type === 'income');

    return {
      filteredTransactions: allTransactions,
      filteredExpenses: expensesList,
      filteredIncome: incomeList,
    };
  }, [expenses, income, searchTerm, categoryFilter, typeFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    categoryFilter !== 'all' ||
    typeFilter !== 'all' ||
    dateFilter !== 'all';

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: currency || 'ZMW',
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" aria-hidden="true" />
            {t('searchFilterTransactions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label={t('searchTransactions')}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
              aria-label={t('filterType')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transactionType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="income">{t('incomeOnly')}</SelectItem>
                <SelectItem value="expense">{t('expensesOnly')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              aria-label={t('filterCategory')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
              aria-label={t('filterDate')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('timePeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTime')}</SelectItem>
                <SelectItem value="week">{t('lastWeek')}</SelectItem>
                <SelectItem value="month">{t('lastMonth')}</SelectItem>
                <SelectItem value="3months">{t('last3Months')}</SelectItem>
                <SelectItem value="year">{t('lastYear')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2"
              aria-disabled={!hasActiveFilters}
              aria-label={t('clearFilters')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t('clearFilters')}
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2" aria-live="polite">
              {searchTerm && <Badge variant="secondary">{t('search')}: "{searchTerm}"</Badge>}
              {typeFilter !== 'all' && <Badge variant="secondary">{t('type')}: {t(typeFilter)}</Badge>}
              {categoryFilter !== 'all' && <Badge variant="secondary">{t('category')}: {t(categoryFilter)}</Badge>}
              {dateFilter !== 'all' && <Badge variant="secondary">{t('period')}: {t(dateFilter)}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground" aria-live="polite">
          {t('foundTransactions', {
            total: filteredTransactions.length,
            income: filteredIncome.length,
            expenses: filteredExpenses.length,
          })}
        </div>

        {filteredTransactions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {filteredIncome.length > 0 && (
              <Badge variant="secondary" className="text-income">
                {t('income')}: {formatCurrency(filteredIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0))}
              </Badge>
            )}
            {filteredExpenses.length > 0 && (
              <Badge variant="secondary" className="text-expense">
                {t('expenses')}: {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0))}
              </Badge>
            )}
          </div>
        )}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">{t('noTransactionsFound')}</p>
          <p>{t('adjustSearchOrFilters')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIncome.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-income">
                  {t('income')} ({filteredIncome.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeList income={filteredIncome} onDelete={onDeleteIncome} />
              </CardContent>
            </Card>
          )}

          {filteredExpenses.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-expense">
                  {t('expenses')} ({filteredExpenses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={filteredExpenses} onDelete={onDeleteExpense} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};