/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Transaction } from '@/types/financial';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { subDays, subMonths, subYears, startOfWeek, format } from 'date-fns';

interface AnalyticsProps {
  expenses: Transaction[];
  income: Transaction[];
  loading?: boolean;
}

type Timeframe = 'daily' | 'week' | 'month' | '3months' | 'year' | 'all';
type TrendView = 'monthly' | 'weekly';

interface AccountOption {
  value: string;
  label: string;
  icon: string;
}

interface AccountTotal extends AccountOption {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ expenses, income, loading = false }) => {
  const { t } = useLanguage();
  const { formatAmount, currency } = useCurrency();
  const { toast } = useToast();

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ZMW: 'ZK',
  };

  const formatCurrencyCode = (code: string) => currencySymbols[code] || code;

  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [currencyFormat, setCurrencyFormat] = useState<'symbol' | 'code'>('symbol');
  const [trendView, setTrendView] = useState<TrendView>('monthly');

  const getStartDate = (range: Timeframe): Date => {
    const now = new Date();
    switch (range) {
      case 'daily':
        return subDays(now, 1);
      case 'week':
        return subDays(now, 7);
      case 'month':
        return subMonths(now, 1);
      case '3months':
        return subMonths(now, 3);
      case 'year':
        return subYears(now, 1);
      case 'all':
      default:
        return new Date(0);
    }
  };

  const startDate = useMemo(() => getStartDate(timeframe), [timeframe]);

  const filteredIncome = useMemo(() => {
    const now = new Date();
    return income.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });
  }, [income, startDate]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });
  }, [expenses, startDate]);

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredExpenses]
  );

  const groupByCategory = (transactions: Transaction[]) => {
    return transactions.reduce((acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const expensesByCategory = useMemo(() => groupByCategory(filteredExpenses), [filteredExpenses]);
  const incomeByCategory = useMemo(() => groupByCategory(filteredIncome), [filteredIncome]);

  const sortedExpenseCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a);

  const sortedIncomeCategories = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a);

  const monthlyTotals = useMemo(() => {
    return [...filteredIncome, ...filteredExpenses].reduce((acc: Record<string, { income: number; expenses: number }>, tx) => {
      const month = tx.date.slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      if (tx.type === 'expense') acc[month].expenses += tx.amount;
      else acc[month].income += tx.amount;
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);
  }, [filteredIncome, filteredExpenses]);

  const weeklyTotals = useMemo(() => {
    const getWeekKey = (dateStr: string) => {
      const dt = new Date(dateStr);
      const jan4 = new Date(dt.getFullYear(), 0, 4);
      const dayOfYear = Math.floor((dt.getTime() - jan4.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      const weekNumber = Math.ceil(dayOfYear / 7);
      return `${dt.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    };

    return [...filteredIncome, ...filteredExpenses].reduce((acc: Record<string, { income: number; expenses: number }>, tx) => {
      const week = getWeekKey(tx.date);
      if (!acc[week]) acc[week] = { income: 0, expenses: 0 };
      if (tx.type === 'expense') acc[week].expenses += tx.amount;
      else acc[week].income += tx.amount;
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);
  }, [filteredIncome, filteredExpenses]);

  const sortedMonths = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const sortedWeeks = Object.entries(weeklyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const EXPENSE_COLORS = ['#FF6B6B', '#FF9F43', '#F7B801', '#6BCB77', '#4D96FF'];
  const INCOME_COLORS = ['#008000', '#1E90FF', '#FFD700', '#FF69B4', '#FF8C00'];

  const formatCurrency = (value: number) => {
    if (currencyFormat === 'symbol') {
      return formatAmount(value);
    } else {
      return `${value.toFixed(2)} ${formatCurrencyCode(currency)}`;
    }
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (trendView === 'monthly') {
      csvContent += "Month,Income,Expenses\n";
      sortedMonths.forEach(([month, data]) => {
        csvContent += `${month},${data.income},${data.expenses}\n`;
      });
    } else {
      csvContent += "Week,Income,Expenses\n";
      sortedWeeks.forEach(([week, data]) => {
        csvContent += `${week},${data.income},${data.expenses}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `analytics_export_${trendView}_${timeframe}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const accountOptions: AccountOption[] = [
    { value: 'Cash', label: 'Cash', icon: '💵' },
    { value: 'Bank', label: 'Bank', icon: '🏦' },
    { value: 'Credit Card', label: 'Credit Card', icon: '💳' },
    { value: 'Debit Card', label: 'Debit Card', icon: '🏧' },
    { value: 'Mobile Money', label: 'Mobile Money', icon: '📱' },
    { value: 'Savings', label: 'Savings', icon: '💰' },
  ];

  const accountTotals = useMemo((): AccountTotal[] => {
    return accountOptions.map(account => {
      const totalIncome = filteredIncome
        .filter(i => i.account === account.value)
        .reduce((sum, i) => sum + i.amount, 0);
      const totalExpenses = filteredExpenses
        .filter(e => e.account === account.value)
        .reduce((sum, e) => sum + e.amount, 0);
      const netBalance = totalIncome - totalExpenses;

      return {
        ...account,
        totalIncome,
        totalExpenses,
        netBalance,
      };
    });
  }, [accountOptions, filteredIncome, filteredExpenses]);

  const maxTotalIncome = useMemo(() => Math.max(...accountTotals.map(a => a.totalIncome), 0), [accountTotals]);
  const maxTotalExpenses = useMemo(() => Math.max(...accountTotals.map(a => a.totalExpenses), 0), [accountTotals]);
  const maxAbsoluteBalance = useMemo(() => Math.max(...accountTotals.map(a => Math.abs(a.netBalance)), 0), [accountTotals]);

  const exportAccountsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Account,Net Balance,Money In,Money Out\n";

    accountTotals.forEach(account => {
      csvContent += `${account.label},${account.netBalance},${account.totalIncome},${account.totalExpenses}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `account_balances_export_${timeframe}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-lg font-semibold dark:text-gray-200">{t('analytics') || 'Analytics'}</h3>

        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('selectTimeframe')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t('daily')}</SelectItem>
            <SelectItem value="week">{t('lastWeek')}</SelectItem>
            <SelectItem value="month">{t('lastMonth')}</SelectItem>
            <SelectItem value="3months">{t('last3Months')}</SelectItem>
            <SelectItem value="year">{t('lastYear')}</SelectItem>
            <SelectItem value="all">{t('allTime')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrencyFormat(curr => (curr === 'symbol' ? 'code' : 'symbol'))
          }
          title={t('toggleCurrencyFormat') || 'Toggle currency format'}
        >
          <DollarSign className="mr-2" />
          {currencyFormat === 'symbol' ? t('symbol') : t('code')}
        </Button>
      </div>

      <Tabs defaultValue="charts">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full mx-auto">
          <TabsTrigger value="charts">{'Charts'}</TabsTrigger>
          <TabsTrigger value="trends">{'Trends'}</TabsTrigger>
          <TabsTrigger value="accounts">{'Accounts'}</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-income bg-gradient-to-br from-income-light to-white dark:from-income-dark dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground dark:text-black">{t('totalIncome')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</div>
                <p className="text-xs text-muted-foreground dark:text-black mt-1">
                  {filteredIncome.length} {t('transactions')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-expense bg-gradient-to-br from-expense-light to-white dark:from-expense-dark dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground dark:text-black">{t('totalExpenses')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground dark:text-black mt-1">
                  {filteredExpenses.length} {t('transactions')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-large bg-gradient-primary text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('netBalance')}</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</div>
                <p className="text-xs opacity-90 mt-1">{totalIncome - totalExpenses >= 0 ? t('surplus') : t('deficit')}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-expense" />
                  {t('expenses')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedExpenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={sortedExpenseCategories.map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {sortedExpenseCategories.map((_, idx) => (
                          <Cell key={idx} fill={EXPENSE_COLORS[idx % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => {
                        if (typeof value === 'number') {
                          return formatCurrency(value);
                        }
                        return String(value);
                      }} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-4">{t('noExpenseData') || 'No expense data available'}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-income" />
                  {t('income')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedIncomeCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={sortedIncomeCategories.map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {sortedIncomeCategories.map((_, idx) => (
                          <Cell key={idx} fill={INCOME_COLORS[idx % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => {
                        if (typeof value === 'number') {
                          return formatCurrency(value);
                        }
                        return String(value);
                      }} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-4">{t('noIncomeData') || 'No income data available'}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant={trendView === 'monthly' ? 'default' : 'outline'}
                onClick={() => setTrendView('monthly')}
              >
                {t('monthly')}
              </Button>
              <Button
                size="sm"
                variant={trendView === 'weekly' ? 'default' : 'outline'}
                onClick={() => setTrendView('weekly')}
              >
                {t('weekly')}
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={exportCSV}>
              {t('exportData') || 'Export Data'}
            </Button>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-income" />
                {t('topIncomeCategories') || 'Top Income Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedIncomeCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedIncomeCategories.slice(0, 5).map(([category, amount]) => {
                    const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2 border p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-income">{formatCurrency(amount)}</div>
                            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-income rounded-full h-2 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t('noIncomeData') || 'No income data available'}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-expense" />
                {t('topExpenseCategories') || 'Top Expense Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedExpenseCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedExpenseCategories.slice(0, 5).map(([category, amount]) => {
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2 border p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-expense">{formatCurrency(amount)}</div>
                            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-expense rounded-full h-2 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t('noExpenseData') || 'No expense data available'}</p>
              )}
            </CardContent>
          </Card>

          {(trendView === 'monthly' ? sortedMonths : sortedWeeks).length > 0 ? (
            <Card className="shadow-soft mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {trendView === 'monthly' ? t('monthlyTrends') : t('weeklyTrends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(trendView === 'monthly' ? sortedMonths : sortedWeeks).map(([period, data]) => {
                    const netAmount = data.income - data.expenses;
                    const maxAmount = Math.max(data.income, data.expenses);

                    const periodLabel =
                      trendView === 'monthly'
                        ? new Date(period + '-01').toLocaleDateString(t('locale') || 'en-US', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : `${period} (${format(startOfWeek(new Date()), 'MMM d')})`;

                    return (
                      <div key={period} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{periodLabel}</span>
                          <Badge variant={netAmount >= 0 ? 'secondary' : 'destructive'}>
                            {netAmount >= 0 ? '+' : ''}
                            {formatCurrency(Math.abs(netAmount))}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs text-income">Income</div>
                            <div className="flex-1 bg-secondary rounded-full h-2">
                              <div
                                className="bg-income rounded-full h-2 transition-all duration-500"
                                style={{ width: maxAmount > 0 ? `${(data.income / maxAmount) * 100}%` : '0%' }}
                              />
                            </div>
                            <div className="w-20 text-xs text-right">{formatCurrency(data.income)}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs text-expense">Expenses</div>
                            <div className="flex-1 bg-secondary rounded-full h-2">
                              <div
                                className="bg-expense rounded-full h-2 transition-all duration-500"
                                style={{ width: maxAmount > 0 ? `${(data.expenses / maxAmount) * 100}%` : '0%' }}
                              />
                            </div>
                            <div className="w-20 text-xs text-right">{formatCurrency(data.expenses)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {t('noTrendData') || 'No trend data available'}
            </p>
          )}
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {'Account Balances'}
              </CardTitle>
              <Button size="sm" variant="outline" onClick={exportAccountsCSV}>
                {t('exportData') || 'Export Data'}
              </Button>
            </CardHeader>
            <CardContent>
              {accountTotals.length > 0 ? (
                <div className="space-y-4">
                  {accountTotals.map(account => {
                    const netBalance = account.netBalance;
                    const isPositive = netBalance >= 0;
                    const percentage = maxAbsoluteBalance > 0 ? (Math.abs(netBalance) / maxAbsoluteBalance) * 100 : 0;
                    const progressBarColor = isPositive ? 'bg-income' : 'bg-expense';
                    const valueColor = isPositive ? 'text-income' : 'text-expense';

                    return (
                      <div key={account.value} className="space-y-4 border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{account.icon}</span>
                            <span className="text-lg font-semibold">{account.label}</span>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${valueColor}`}>{formatCurrency(netBalance)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {isPositive ? 'Surplus' : 'Deficit'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-24 text-sm text-income">Money In</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full">
                              <div
                                className="h-full bg-income rounded-full transition-all duration-500"
                                style={{ width: `${(account.totalIncome / maxTotalIncome) * 100}%` }}
                              />
                            </div>
                            <span className="w-24 text-sm text-right text-income">{formatCurrency(account.totalIncome)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 text-sm text-expense">Money Out</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full">
                              <div
                                className="h-full bg-expense rounded-full transition-all duration-500"
                                style={{ width: `${(account.totalExpenses / maxTotalExpenses) * 100}%` }}
                              />
                            </div>
                            <span className="w-24 text-sm text-right text-expense">{formatCurrency(account.totalExpenses)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {'No account data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;