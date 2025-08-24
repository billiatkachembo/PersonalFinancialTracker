import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Edit, Trash2, Save, X } from 'lucide-react';
import { Transaction } from './FinancialTracker';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/categories';

interface FinancialCalendarProps {
  expenses: Transaction[];
  income: Transaction[];
  onUpdateExpense?: (id: string, updates: Partial<Transaction>) => void;
  onUpdateIncome?: (id: string, updates: Partial<Transaction>) => void;
  onDeleteExpense?: (id: string) => void;
  onDeleteIncome?: (id: string) => void;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ 
  expenses, 
  income, 
  onUpdateExpense, 
  onUpdateIncome, 
  onDeleteExpense, 
  onDeleteIncome 
}) => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTransactionsForDate = (day: number) => {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const dayExpenses = expenses.filter(expense => expense.date === dateStr);
  const dayIncome = income.filter(inc => inc.date === dateStr);
  
  return { expenses: dayExpenses, income: dayIncome };
  };

  const goToPreviousMonth = () => {
  setCurrentDate(new Date(year, month - 1));
  };

  const goToNextMonth = () => {
  setCurrentDate(new Date(year, month + 1));
  };

  const calculateTotals = () => {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthStr));
  const monthIncome = income.filter(inc => inc.date.startsWith(monthStr));
  
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  
  return { totalExpenses, totalIncome, monthExpenses, monthIncome };
  };

  const { totalExpenses, totalIncome } = calculateTotals();

  const startEdit = (transaction: Transaction) => {
  setEditingTransaction(transaction);
  setEditForm(transaction);
  };

  const cancelEdit = () => {
  setEditingTransaction(null);
  setEditForm({});
  };

  const saveEdit = () => {
  if (!editingTransaction || !editForm.amount || !editForm.category || !editForm.description) {
  toast({
 title: "Error",
 description: "Please fill in all required fields",
 variant: "destructive",
  });
  return;
  }

  const updates = {
  amount: parseFloat(editForm.amount.toString()),
  category: editForm.category,
  description: editForm.description,
  account: editForm.account,
  date: editForm.date
  };

  if (editingTransaction.type === 'expense' && onUpdateExpense) {
  onUpdateExpense(editingTransaction.id, updates);
  } else if (editingTransaction.type === 'income' && onUpdateIncome) {
  onUpdateIncome(editingTransaction.id, updates);
  }

  toast({
  title: "Success",
  description: "Transaction updated successfully",
  });

  cancelEdit();
  };

  const deleteTransaction = (transaction: Transaction) => {
  if (transaction.type === 'expense' && onDeleteExpense) {
  onDeleteExpense(transaction.id);
  } else if (transaction.type === 'income' && onDeleteIncome) {
  onDeleteIncome(transaction.id);
  }

  toast({
  title: "Success",
  description: "Transaction deleted successfully",
  });
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
  calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
  calendarDays.push(day);
  }

  return (
  <div className="space-y-6">
  {/* Calendar Header */}
  <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <h2 className="text-2xl font-bold">
 {monthNames[month]} {year}
 </h2>
 <Button variant="outline" size="icon" onClick={goToNextMonth}>
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 
 <div className="flex gap-4">
 <div className="text-sm text-muted-foreground">
 {t('income')}: {formatAmount(totalIncome)} | {t('expenses')}: {formatAmount(totalExpenses)}
 </div>
 </div>
  </div>

  {/* Calendar Grid */}
  <Card className="shadow-medium">
 <CardContent className="p-6">
 {/* Days of the week header */}
 <div className="grid grid-cols-7 gap-2 mb-4">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
 <div key={day} className="text-center font-medium text-muted-foreground p-2">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar days */}
 <div className="grid grid-cols-7 gap-2">
 {calendarDays.map((day, index) => {
 if (!day) {
 return <div key={index} className="p-2 h-20"></div>;
 }

 const { expenses: dayExpenses, income: dayIncome } = getTransactionsForDate(day);
 const hasTransactions = dayExpenses.length > 0 || dayIncome.length > 0;
 const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

 function setCategory(value: string): void {
 throw new Error('Function not implemented.');
 }

 return (
 <Dialog key={day}>
 <DialogTrigger asChild>
  <div
  className={`
  p-2 h-20 border rounded-lg relative cursor-pointer
  ${isToday ? 'bg-primary/10 border-primary' : 'border-border'}
  ${hasTransactions ? 'hover:shadow-soft transition-shadow ring-1 ring-primary/20' : ''}
  `}
  >
  <div className="font-medium text-sm">{day}</div>
  
  {/* Transaction indicators */}
  <div className="absolute bottom-1 left-1 right-1 space-y-1">
  {dayIncome.length > 0 && (
  <div className="h-1 bg-income rounded-full" title={`${dayIncome.length} income entries`}></div>
  )}
  {dayExpenses.length > 0 && (
  <div className="h-1 bg-expense rounded-full" title={`${dayExpenses.length} expense entries`}></div>
  )}
  </div>

  {/* Transaction count badges */}
  {hasTransactions && (
  <div className="absolute top-1 right-1 flex gap-1">
  {dayIncome.length > 0 && (
  <div className="w-2 h-2 bg-income rounded-full"></div>
  )}
  {dayExpenses.length > 0 && (
  <div className="w-2 h-2 bg-expense rounded-full"></div>
  )}
  </div>
  )}
  </div>
 </DialogTrigger>
 {hasTransactions && (
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
  <DialogHeader>
  <DialogTitle>
  {t('transactionsFor')} {day}/{month + 1}/{year}
  </DialogTitle>
  </DialogHeader>
  <div className="space-y-4 mt-4">
  {dayIncome.length > 0 && (
  <div>
  <h3 className="font-semibold text-income mb-2">{t('income')}</h3>
  <div className="space-y-2">
  {dayIncome.map((transaction) => (
 <div key={transaction.id} className="p-3 border border-income/20 rounded-lg bg-income/5">
 {editingTransaction?.id === transaction.id ? (
 <div className="space-y-3">
   <div className="grid grid-cols-2 gap-2">
   <div>
   <Label className="text-xs">Amount</Label>
   <Input
  type="number"
  step="0.01"
  value={editForm.amount || ''}
  onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
  className="h-8"
   />
   </div>
   <div>
   <Label className="text-xs">Category</Label>
   <Select value={editForm.category || ''} onValueChange={(value) => setEditForm({...editForm, category: value})}>
  <SelectTrigger className="h-8">
  <SelectValue />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="Business">🏢 Business</SelectItem>
  <SelectItem value="Investment">📈 Investment</SelectItem>
  <SelectItem value="Saving">🏦 Saving</SelectItem>
  <SelectItem value="Gift">🎁 Gift</SelectItem>
  <SelectItem value="Allowance">🪙 Allowance</SelectItem>
  <SelectItem value="Petty Cash">💵 Petty Cash</SelectItem>
  <SelectItem value="Other">🔖 Other</SelectItem>
  </SelectContent>
   </Select>
   </div>
   </div>
   <div>
   <Label className="text-xs">Description</Label>
   <Input
   value={editForm.description || ''}
   onChange={(e) => setEditForm({...editForm, description: e.target.value})}
   className="h-8"
   />
   </div>
   <div className="flex gap-2">
   <Button size="sm" onClick={saveEdit} className="h-8">
   <Save className="h-3 w-3 mr-1" />
   Save
   </Button>
   <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
   <X className="h-3 w-3 mr-1" />
   Cancel
   </Button>
   </div>
 </div>
 ) : (
 <div className="flex justify-between items-start">
   <div className="flex-1">
   <p className="font-medium">{transaction.description}</p>
   <p className="text-sm text-muted-foreground">
   {transaction.category} {transaction.account && `• ${transaction.account}`}
   </p>
   </div>
   <div className="flex items-center gap-2">
   <p className="font-semibold text-income">+{formatAmount(transaction.amount)}</p>
   <div className="flex gap-1">
   <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => startEdit(transaction)}
  className="h-6 w-6 p-0"
   >
  <Edit className="h-3 w-3" />
   </Button>
   <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => deleteTransaction(transaction)}
  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
   >
  <Trash2 className="h-3 w-3" />
   </Button>
   </div>
   </div>
 </div>
 )}
 </div>
  ))}
  </div>
  </div>
  )}
  {dayExpenses.length > 0 && (
  <div>
  <h3 className="font-semibold text-expense mb-2">{t('expenses')}</h3>
  <div className="space-y-2">
  {dayExpenses.map((transaction) => (
 <div key={transaction.id} className="p-3 border border-expense/20 rounded-lg bg-expense/5">
 {editingTransaction?.id === transaction.id ? (
 <div className="space-y-3">
   <div className="grid grid-cols-2 gap-2">
   <div>
   <Label className="text-xs">Amount</Label>
   <Input
  type="number"
  step="0.01"
  value={editForm.amount || ''}
  onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
  className="h-8"
   />
   </div>
   <div>
<Label className="text-xs">Category</Label>
<Select
  value={editForm.category || ''}
  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
>

  <SelectTrigger className="h-8 w-48">
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent className="grid grid-cols-2 gap-2 p-2 max-h-[280px] overflow-auto">
    <SelectItem value="food-dining">🍽️ Food & Dining</SelectItem>
    <SelectItem value="transportation">🚗 Transportation</SelectItem>
    <SelectItem value="shopping">🛍️ Shopping</SelectItem>
    <SelectItem value="bills-utilities">💡 Bills & Utilities</SelectItem>
    <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
    <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
    <SelectItem value="education">🎓 Education</SelectItem>
    <SelectItem value="travel">✈️ Travel</SelectItem>
    <SelectItem value="housing">🏠 Housing</SelectItem>
    <SelectItem value="apparel">👗 Apparel</SelectItem>
    <SelectItem value="beauty">💄 Beauty</SelectItem>
    <SelectItem value="culture">🎭 Culture</SelectItem>
    <SelectItem value="loan">💰 Loan</SelectItem>
    <SelectItem value="other">🔖 Other</SelectItem>
  </SelectContent>
</Select>



   </div>
   </div>
   <div>
   <Label className="text-xs">Description</Label>
   <Input
   value={editForm.description || ''}
   onChange={(e) => setEditForm({...editForm, description: e.target.value})}
   className="h-8"
   />
   </div>
   <div className="flex gap-2">
   <Button size="sm" onClick={saveEdit} className="h-8">
   <Save className="h-3 w-3 mr-1" />
   Save
   </Button>
   <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
   <X className="h-3 w-3 mr-1" />
   Cancel
   </Button>
   </div>
 </div>
 ) : (
 <div className="flex justify-between items-start">
   <div className="flex-1">
   <p className="font-medium">{transaction.description}</p>
   <p className="text-sm text-muted-foreground">
   {transaction.category} {transaction.account && `• ${transaction.account}`}
   </p>
   </div>
   <div className="flex items-center gap-2">
   <p className="font-semibold text-expense">-{formatAmount(transaction.amount)}</p>
   <div className="flex gap-1">
   <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => startEdit(transaction)}
  className="h-6 w-6 p-0"
   >
  <Edit className="h-3 w-3" />
   </Button>
   <Button 
  size="sm" 
  variant="ghost" 
  onClick={() => deleteTransaction(transaction)}
  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
   >
  <Trash2 className="h-3 w-3" />
   </Button>
   </div>
   </div>
 </div>
 )}
 </div>
  ))}
  </div>
  </div>
  )}
  </div>
  </DialogContent>
 )}
 </Dialog>
 );
 })}
 </div>
 </CardContent>
  </Card>

  {/* Legend */}
  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
 <div className="flex items-center gap-2">
 <div className="w-4 h-1 bg-income rounded-full"></div>
 <span>{t('income')}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-4 h-1 bg-expense rounded-full"></div>
 <span>{t('expenses')}</span>
 </div>
 <p className="text-xs">{t('clickDateToView')}</p>
  </div>
  </div>
  );
};