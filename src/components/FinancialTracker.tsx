/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/FinancialTracker.tsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Calendar,
  Plus,
  Eye,
  BarChart3,
  Search,
  StickyNote,
  Menu,
  Minus,
  X,
  UserCircle,
  TrendingUp,
  ChevronDown,
  Repeat2

}
 
from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import ThemeToggle from './ThemeToggle';
import { LanguageCurrencySelector } from './LanguageCurrencySelector';
import { BiMoneyWithdraw, BiTrendingDown } from 'react-icons/bi';
import { Transaction, TransferData } from '@/types/financial';
import Spinner from './Spinner';

// Lazy load heavy components
// Replace the lazy imports with this corrected version:
const TransferForm = lazy(() => import('./TransferForm').then(module => ({ default: module.TransferForm })));
const ExpenseForm = lazy(() => import('./ExpenseForm').then(module => ({ default: module.ExpenseForm })));
const IncomeForm = lazy(() => import('./IncomeForm').then(module => ({ default: module.IncomeForm })));
const ExpenseList = lazy(() => import('./ExpenseList').then(module => ({ default: module.ExpenseList })));
const IncomeList = lazy(() => import('./IncomeList').then(module => ({ default: module.IncomeList })));
const FinancialCalendar = lazy(() => import('./FinancialCalendar').then(module => ({ default: module.FinancialCalendar })));

// In FinancialTracker.tsx - change the import to:
const Analytics = lazy(() => import('./Analytics'));
const SearchExpenses = lazy(() => import('./SearchExpenses').then(module => ({ default: module.SearchExpenses })));
const Notes = lazy(() => import('./Notes').then(module => ({ default: module.Notes })));
const PasscodeManager = lazy(() => import('./PasscodeManager').then(module => ({ default: module.PasscodeManager })));
// In FinancialTracker.tsx
const Profile = lazy(() => import('@/pages/Profile'));
const FinancialTracker = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();

  // Memoized calculations
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );

  const totalIncome = useMemo(() => 
    income.reduce((sum, inc) => sum + inc.amount, 0), 
    [income]
  );

  const netBalance = useMemo(() => totalIncome - totalExpenses, 
    [totalIncome, totalExpenses]
  );

  // Load data from localStorage on mount with error handling
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      const savedIncome = localStorage.getItem('income');
      
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedIncome) setIncome(JSON.parse(savedIncome));
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data on changes with error handling
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  };

  useEffect(() => {
    saveToLocalStorage('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    saveToLocalStorage('income', income);
  }, [income]);

  // Passcode lock check on load
  useEffect(() => {
    const hasPasscode = localStorage.getItem('app-passcode');
    const isAuthenticated = sessionStorage.getItem('app-authenticated');
    if (hasPasscode && !isAuthenticated) setIsLocked(true);
  }, []);

  const addExpense = (expense: Omit<Transaction, 'id' | 'type'>) => {
    const newExpense: Transaction = {
      ...expense,
      id: Date.now().toString(),
      type: 'expense',
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const addIncome = (incomeEntry: Omit<Transaction, 'id' | 'type'>) => {
    const newIncome: Transaction = {
      ...incomeEntry,
      id: Date.now().toString(),
      type: 'income',
    };
    setIncome((prev) => [newIncome, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const deleteIncome = (id: string) => {
    setIncome((prev) => prev.filter((income) => income.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<Transaction>) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === id ? { ...expense, ...updates } : expense))
    );
  };

  const updateIncome = (id: string, updates: Partial<Transaction>) => {
    setIncome((prev) =>
      prev.map((income) => (income.id === id ? { ...income, ...updates } : income))
    );
  };
  
  // Type-safe transfer handler
  const handleTransfer = (transferData: TransferData) => {
    // Add the transfer as an expense
    const expenseTransaction: Omit<Transaction, 'id' | 'type'> = {
      date: transferData.date,
      amount: transferData.amount,
      category: 'Transfer',
      description: `Transfer to ${transferData.toAccount}: ${transferData.description}`,
      account: transferData.fromAccount,
    };
    addExpense(expenseTransaction);

    // Add the transfer as income
    const incomeTransaction: Omit<Transaction, 'id' | 'type'> = {
      date: transferData.date,
      amount: transferData.amount,
      category: 'Transfer',
      description: `Transfer from ${transferData.fromAccount}: ${transferData.description}`,
      account: transferData.toAccount,
    };
    addIncome(incomeTransaction);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-64">
          <Spinner />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-income bg-gradient-to-br from-income-light to-white dark:from-income-dark dark:to-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted">
                    {t('totalIncome')}
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-income" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-income">{formatAmount(totalIncome)}</div>
                  <Badge variant="secondary" className="mt-1">
                    {income.length} {t('entries')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-expense bg-gradient-to-br from-expense-light to-white dark:from-expense-dark dark:to-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted">
                    {t('totalExpenses')}
                  </CardTitle>
                  <BiTrendingDown className="h-4 w-4 text-expense" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-expense">{formatAmount(totalExpenses)}</div>
                  <Badge variant="secondary" className="mt-1">
                    {expenses.length} {t('entries')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-large bg-gradient-primary text-primary-foreground dark:bg-muted dark:text-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('netBalance')}</CardTitle>
                  <BiMoneyWithdraw className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(netBalance)}</div>
                  <Badge variant={netBalance >= 0 ? 'secondary' : 'destructive'} className="mt-1">
                    {netBalance >= 0 ? t('positive') : t('negative')}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-income">{t('recentIncome')}</CardTitle>
                  <CardDescription>{t('latestIncome')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Spinner />}>
                    <IncomeList income={income.slice(0, 5)} onDelete={deleteIncome} showActions={true} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-expense">{t('recentExpenses')}</CardTitle>
                  <CardDescription>{t('latestExpenses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Spinner />}>
                    <ExpenseList expenses={expenses.slice(0, 5)} onDelete={deleteExpense} showActions={true} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'add-income':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-income">{t('addIncome')}</CardTitle>
              <CardDescription>{t('recordIncome')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <IncomeForm onSubmit={addIncome} />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'add-expense':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-expense">{t('addExpense')}</CardTitle>
              <CardDescription>{t('trackSpending')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <ExpenseForm onSubmit={addExpense} />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'transfer':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">Transfer Funds</CardTitle>
              <CardDescription>Move Money Between Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <TransferForm onSubmit={handleTransfer} />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'calendar':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>{t('calendar')}</CardTitle>
              <CardDescription>{t('viewTransactionsByDate')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <FinancialCalendar
                  expenses={expenses}
                  income={income}
                  onUpdateExpense={updateExpense}
                  onUpdateIncome={updateIncome}
                  onDeleteExpense={deleteExpense}
                  onDeleteIncome={deleteIncome}
                />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'analytics':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>{t('analytics')}</CardTitle>
              <CardDescription>{t('viewInsightsAndTrends')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <Analytics expenses={expenses} income={income} />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'search':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>{t('search')}</CardTitle>
              <CardDescription>{t('findAndFilterTransactions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <SearchExpenses
                  expenses={expenses}
                  income={income}
                  onDeleteExpense={deleteExpense}
                  onDeleteIncome={deleteIncome}
                />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'notes':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                {t('notes')}
              </CardTitle>
              <CardDescription>{t('keepTrackOfFinancialNotes')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Spinner />}>
                <Notes />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'profile':
        return (
          <Suspense fallback={<Spinner />}>
            <Profile onUnlock={() => setIsLocked(false)} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Suspense fallback={<Spinner />}>
          <PasscodeManager onUnlock={() => setIsLocked(false)} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {('appTitle')}
            </h1>

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'overview' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('overview')}
                    aria-label="View financial overview"
                    aria-current={activeTab === 'overview' ? 'page' : undefined}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('overview')}
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[200px]">
                      <li>
                        <NavigationMenuLink
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                          onClick={() => setActiveTab('add-income')}
                          aria-label="Add income"
                        >
                          <div className="text-sm font-medium leading-none">{t('addIncome')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('recordIncome')}
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                          onClick={() => setActiveTab('add-expense')}
                          aria-label="Add expense"
                        >
                          <div className="text-sm font-medium leading-none">{t('addExpense')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('trackSpending')}
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                          onClick={() => setActiveTab('transfer')}
                          aria-label="Transfer funds"
                        >
                          <div className="text-sm font-medium leading-none">Transfer Funds</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Move Money Between Accounts
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'calendar' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('calendar')}
                    aria-label="View calendar"
                    aria-current={activeTab === 'calendar' ? 'page' : undefined}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('calendar')}
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'analytics' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('analytics')}
                    aria-label="View analytics"
                    aria-current={activeTab === 'analytics' ? 'page' : undefined}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('analytics')}
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'search' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('search')}
                    aria-label="Search transactions"
                    aria-current={activeTab === 'search' ? 'page' : undefined}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('search')}
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'notes' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('notes')}
                    aria-label="View notes"
                    aria-current={activeTab === 'notes' ? 'page' : undefined}
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    {t('notes')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'profile' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('profile')}
                    aria-label="View profile"
                    aria-current={activeTab === 'profile' ? 'page' : undefined}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    {t('profile')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="hidden lg:flex items-center space-x-4">
              <LanguageCurrencySelector />
              <ThemeToggle />
            </div>

            <div className="lg:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Toggle menu"
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border shadow-md">
          <nav className="flex flex-col space-y-1 p-4">
            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'overview' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              aria-label="View financial overview"
            >
              <Eye className="h-5 w-5" />
              {t('overview')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'add-income' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('add-income');
                setMobileMenuOpen(false);
              }}
              aria-label="Add income"
            >
              <Plus className="h-5 w-5" />
              {t('addIncome')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'add-expense' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('add-expense');
                setMobileMenuOpen(false);
              }}
              aria-label="Add expense"
            >
              <Minus className="h-5 w-5" />
              {t('addExpense')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'transfer' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('transfer');
                setMobileMenuOpen(false);
              }}
              aria-label="Transfer funds"
            >
              <Repeat2 className="h-5 w-5" />
              Transfer Funds
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'calendar' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('calendar');
                setMobileMenuOpen(false);
              }}
              aria-label="View calendar"
            >
              <Calendar className="h-5 w-5" />
              {t('calendar')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'analytics' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('analytics');
                setMobileMenuOpen(false);
              }}
              aria-label="View analytics"
            >
              <BarChart3 className="h-5 w-5" />
              {t('analytics')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'search' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('search');
                setMobileMenuOpen(false);
              }}
              aria-label="Search transactions"
            >
              <Search className="h-5 w-5" />
              {t('search')}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none">
                <Menu className="h-5 w-5" />
                More
                <ChevronDown className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-32px)] p-1">
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('notes');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3"
                  aria-label="View notes"
                >
                  <StickyNote className="h-5 w-5" />
                  {t('notes')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3"
                  aria-label="View profile"
                >
                  <UserCircle className="h-5 w-5" />
                  {('profile')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mt-4">
              <LanguageCurrencySelector />
            </div>
          </nav>
        </div>
      )}

      <main className="container mx-auto px-6 py-6">
        <Suspense fallback={<Spinner />}>
          {renderContent()}
        </Suspense>
      </main>
    </div>
  );
};

export default FinancialTracker;