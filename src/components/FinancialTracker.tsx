/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/FinancialTracker.tsx
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TransferForm } from './TransferForm';
import { ExpenseForm } from './ExpenseForm';
import { IncomeForm } from './IncomeForm';
import { ExpenseList } from './ExpenseList';
import { IncomeList } from './IncomeList';
import { FinancialCalendar } from './FinancialCalendar';
import Analytics from './Analytics';
import { SearchExpenses } from './SearchExpenses';
import { Notes } from './Notes';
import { PasscodeManager } from './PasscodeManager';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import ThemeToggle from './ThemeToggle';
import { LanguageCurrencySelector } from './LanguageCurrencySelector';
import { BiMoneyWithdraw, BiTrendingDown } from 'react-icons/bi';
import Profile from '@/pages/Profile';


export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  account?: string;
  type: 'expense' | 'income';
}

const FinancialTracker = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLocked, setIsLocked] = useState(false);
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedIncome = localStorage.getItem('income');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedIncome) setIncome(JSON.parse(savedIncome));
  }, []);

  // Save data on changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
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
  
  // New function to handle transfers
  const handleTransfer = (transferData: any) => {
    // Add the transfer as an expense
    const expenseTransaction: Omit<Transaction, 'id' | 'type'> = {
      date: transferData.date,
      amount: transferData.amount,
      category: 'Transfer', // A transfer from one account is an expense from that account
      description: `Transfer to ${transferData.toAccount}: ${transferData.description}`,
      account: transferData.fromAccount,
    };
    addExpense(expenseTransaction);

    // Add the transfer as income
    const incomeTransaction: Omit<Transaction, 'id' | 'type'> = {
      date: transferData.date,
      amount: transferData.amount,
      category: 'Transfer', // A transfer to another account is income for that account
      description: `Transfer from ${transferData.fromAccount}: ${transferData.description}`,
      account: transferData.toAccount,
    };
    addIncome(incomeTransaction);
  };

  // Calculate totals and net balance here, so they are in scope for renderContent
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const renderContent = () => {
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
                  {/* The showActions prop is set to true to display the delete buttons */}
                  <IncomeList income={income.slice(0, 5)} onDelete={deleteIncome} showActions={true} />
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-expense">{t('recentExpenses')}</CardTitle>
                  <CardDescription>{t('latestExpenses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* The showActions prop is set to true to display the delete buttons */}
                  <ExpenseList expenses={expenses.slice(0, 5)} onDelete={deleteExpense} showActions={true} />
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
              <IncomeForm onSubmit={addIncome} />
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
              <ExpenseForm onSubmit={addExpense} />
            </CardContent>
          </Card>
        );
      case 'transfer':
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-primary">{('Transfer Funds')}</CardTitle>
              <CardDescription>{('Move Money Between Accounts')}</CardDescription>
            </CardHeader>
            <CardContent>
              <TransferForm onSubmit={handleTransfer} />
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
              <FinancialCalendar
                expenses={expenses}
                income={income}
                onUpdateExpense={updateExpense}
                onUpdateIncome={updateIncome}
                onDeleteExpense={deleteExpense}
                onDeleteIncome={deleteIncome}
              />
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
              <Analytics expenses={expenses} income={income} />
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
              <SearchExpenses
                expenses={expenses}
                income={income}
                onDeleteExpense={deleteExpense}
                onDeleteIncome={deleteIncome}
              />
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
              <Notes />
            </CardContent>
          </Card>
        );
case 'profile':
  return <Profile onUnlock={() => setIsLocked(false)} />;
      default:
        return null;
    }
  };

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <PasscodeManager onUnlock={() => setIsLocked(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('appTitle')}
            </h1>

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeTab === 'overview' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => setActiveTab('overview')}
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
                        >
                          <div className="text-sm font-medium leading-none">{('Transfer Funds')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {('Move Money Between Accounts')}
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
            >
              <Repeat2 className="h-5 w-5" />
              {('transferFunds')}
            </button>

            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'calendar' ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                setActiveTab('calendar');
                setMobileMenuOpen(false);
              }}
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
            >
              <Search className="h-5 w-5" />
              {t('search')}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none">
                <Menu className="h-5 w-5" />
                {('more')}
                <ChevronDown className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-32px)] p-1">
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('notes');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3"
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
                >
                  <UserCircle className="h-8 w-7" />
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

      <main className="container mx-auto px-6 py-6">{renderContent()}</main>
    </div>
  );
};

export default FinancialTracker;