/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { categories } from '@/lib/categories';

interface ExpenseFormData {
  date: string;
  amount: number;
  category: string;
  description: string;
  account?: string;
  repeat?: string;
  repeatStart?: string;
  repeatEnd?: string;
}

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseFormData) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    description: '',
    account: 'Cash',
    repeat: 'one-time',
    repeatStart: '',
    repeatEnd: '',
  });

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');

  const { toast } = useToast();
  const { t } = useLanguage();
  const { currencies, currency } = useCurrency();

  const repeatOptions = [
    { value: 'one-time', label: t('oneTime') || 'One-time' },
    { value: 'daily', label: t('daily') || 'Daily' },
    { value: 'weekly', label: t('weekly') || 'Weekly' },
    { value: 'monthly', label: t('monthly') || 'Monthly' },
    { value: 'yearly', label: t('yearly') || 'Yearly' },
  ];

  const handleInputChange = (field: keyof ExpenseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalcInput = (char: string) => {
    if (char === '=') {
      try {
        const result = eval(calcExpression || formData.amount.toString());
        handleInputChange('amount', parseFloat(result.toString()));
        setCalcExpression('');
        setIsCalculatorOpen(false);
      } catch {
        toast({ title: t('error') || 'Error', description: t('invalidCalculation') || 'Invalid calculation', variant: 'destructive' });
      }
    } else if (char === 'C') {
      setCalcExpression('');
    } else if (char === 'DEL') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else {
      setCalcExpression(prev => prev + char);
    }
  };

  useEffect(() => {
    if (!isCalculatorOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.'].includes(e.key)) handleCalcInput(e.key);
      else if (e.key === 'Enter') handleCalcInput('=');
      else if (e.key === 'Escape') setIsCalculatorOpen(false);
      else if (e.key.toLowerCase() === 'c') handleCalcInput('C');
      else if (e.key === 'Backspace') handleCalcInput('DEL');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCalculatorOpen, calcExpression]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: t('error') || 'Error',
        description: t('fillAllFields') || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: t('error') || 'Error',
        description: t('amountGreaterThanZero') || 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (formData.repeat !== 'one-time' && (!formData.repeatStart || !formData.repeatEnd)) {
      toast({
        title: t('error') || 'Error',
        description: t('repeatStartEndRequired') || 'Please provide both repeat start and end dates',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(formData);

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: '',
      description: '',
      account: 'Cash',
      repeat: 'one-time',
      repeatStart: '',
      repeatEnd: '',
    });

    setCalcExpression('');

    toast({
      title: t('success') || 'Success',
      description: t('expenseAdded') || 'Expense added successfully!',
      variant: 'default',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense-date">{t('date') || 'Date'}</Label>
          <Input
            id="expense-date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-amount">{t('amount') || 'Amount'} ({currencies[currency].symbol}) *</Label>
          <div className="flex relative">
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              value={calcExpression || formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
              placeholder="0.00"
              className="shadow-soft pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <Calculator className="h-6 w-7 text-muted-foreground" />
            </Button>
          </div>

        {isCalculatorOpen && (
  <div  className="inline top-16 right-10 w-64 p-2 rounded-lg shadow-md bg-background text-foreground z-50">

              <div className="mb-2 text-right font-mono select-none border-b-2 pb-1 border-gray-200">
      {calcExpression || formData.amount || '0'}
    </div>
    <div className="grid grid-cols-5 gap-1">
      {['7','8','9','+','4','5','6','-','1','2','3','*','0','.','=','/','C','DEL'].map((char) => (
        <Button key={char} type="button" variant="outline" size="sm" onClick={() => handleCalcInput(char)}>
          {char}
        </Button>
      ))}
    </div>
  </div>
)}
</div>
</div>

      {/* Category, Account, Repeat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense-category">{t('category')} *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent className="space-y-2 p-2 max-h-[300px] overflow-auto">
              {Object.entries(categories).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  <div className="text-xs font-semibold text-muted-foreground px-3 py-1 uppercase">{t(groupName)}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {groupItems.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{t(label) || label}</SelectItem>
                    ))}
                  </div>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-account">{t('account') || 'Account'}</Label>
          <Select
            value={formData.account}
            onValueChange={(value) => handleInputChange('account', value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={t('selectAccount') || 'Select account'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">💵 {t('Cash') || 'Cash'}</SelectItem>
              <SelectItem value="Bank">🏦 {t('Bank') || 'Bank'}</SelectItem>
              <SelectItem value="Credit Card">💳 {t('Credit Card') || 'Credit Card'}</SelectItem>
              <SelectItem value="Debit Card">🏧 {t('Debit Card') || 'Debit Card'}</SelectItem>
              <SelectItem value="Mobile Money">📱 {t('Mobile Money') || 'Mobile Money'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-repeat">{t('repeat') || 'Repeat'}</Label>
          <Select
            value={formData.repeat}
            onValueChange={(value) => handleInputChange('repeat', value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={t('repeatFrequency') || 'Repeat frequency'} />
            </SelectTrigger>
            <SelectContent>
              {repeatOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repeat Start/End */}
      {formData.repeat !== 'one-time' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repeat-start">{t('repeatStart') || 'Repeat Start'} *</Label>
            <Input
              id="repeat-start"
              type="date"
              value={formData.repeatStart}
              onChange={(e) => handleInputChange('repeatStart', e.target.value)}
              className="shadow-soft"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeat-end">{t('repeatEnd') || 'Repeat End'} *</Label>
            <Input
              id="repeat-end"
              type="date"
              value={formData.repeatEnd}
              onChange={(e) => handleInputChange('repeatEnd', e.target.value)}
              className="shadow-soft"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="expense-description">{t('description') || 'Description'} *</Label>
        <Textarea
          id="expense-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('expensePlaceholder') || 'What did you spend on?'}
          className="shadow-soft"
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" variant="expense" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t('addExpense')}
      </Button>
    </form>
  );
};
