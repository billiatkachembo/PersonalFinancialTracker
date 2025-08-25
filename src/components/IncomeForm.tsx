/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
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
import { Plus, Tag, Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';

const incomeSourceOptions = [
  { value: 'salary', label: 'Salary', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'bonus', label: 'Bonus', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'business', label: 'Business', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'investment', label: 'Investment', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'rental', label: 'Rental Income', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'freelance', label: 'Freelance', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'gift', label: 'Gift', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'allowance', label: 'Allowance', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'refund', label: 'Refund', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'dividend', label: 'Dividend', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'other', label: 'Other', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
  { value: 'savings', label: 'Savings', icon: <Tag className="inline w-4 h-4 mr-1 text-muted-foreground" /> },
];

const repeatOptions = [
  { value: 'one-time', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface IncomeFormData {
  date: string;
  amount: number;
  source: string;
  category: string;
  description: string;
  account?: string;
  repeat?: string;
  repeatStart?: string;
  repeatEnd?: string;
}

interface IncomeFormProps {
  onSubmit: (income: IncomeFormData) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<IncomeFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    source: '',
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

  const handleInputChange = (field: keyof IncomeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.source || !formData.description) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (formData.amount <= 0) {
      toast({ title: 'Error', description: 'Amount must be greater than 0', variant: 'destructive' });
      return;
    }
    if (formData.repeat !== 'one-time' && (!formData.repeatStart || !formData.repeatEnd)) {
      toast({ title: 'Error', description: 'Please provide both repeat start and end dates', variant: 'destructive' });
      return;
    }
    onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      source: '',
      category: '',
      description: '',
      account: 'Cash',
      repeat: 'one-time',
      repeatStart: '',
      repeatEnd: '',
    });
    setCalcExpression('');
    setIsCalculatorOpen(false);
    toast({ title: 'Success', description: 'Income added successfully!', variant: 'default' });
  };

  const handleCalcInput = (char: string) => {
    if (char === '=') {
      try {
        const result = eval(calcExpression || formData.amount.toString());
        handleInputChange('amount', parseFloat(result.toString()));
        setCalcExpression('');
        setIsCalculatorOpen(false);
      } catch {
        toast({ title: 'Error', description: 'Invalid calculation', variant: 'destructive' });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income-date">Date</Label>
          <Input
            id="income-date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income-amount">
            Amount ({currencies[currency].symbol}) *
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="income-amount"
              type="number"
              step="0.01"
              min="0"
              value={calcExpression || formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
              placeholder="0.00"
              className="shadow-soft flex-1"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {isCalculatorOpen && (
            <div  className="inline top-16 right-10 w-64 p-2 rounded-lg shadow-md bg-background text-foreground z-50">

              <div className="mb-2 text-right font-mono select-none border-b-2 pb-1 border-gray-200">{calcExpression || formData.amount}</div>
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

      {/* Source, Account, Repeat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income-source">Source *</Label>
          <Select
            value={formData.source}
            onValueChange={(value) => handleInputChange('source', value)}
            required
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={('Select income source')} />
            </SelectTrigger>
            <SelectContent className="space-y-2 p-2 max-h-[300px] overflow-auto">
              {incomeSourceOptions.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value} className="flex items-center gap-2">
                  {icon} {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="income-account">{('account')}</Label>
          <Select
            value={formData.account}
            onValueChange={(value) => handleInputChange('account', value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={('selectAccount')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">💵 {t('cash')}</SelectItem>
              <SelectItem value="Savings">🏦 {t('savings')}</SelectItem>
              <SelectItem value="Bank">🏦 {t('bank')}</SelectItem>
              <SelectItem value="Credit Card">💳 {t('creditCard')}</SelectItem>
              <SelectItem value="Debit Card">🏧 {t('debitCard')}</SelectItem>
              <SelectItem value="Mobile Money">📱 {t('mobileMoney')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="income-repeat">Repeat</Label>
          <Select
            value={formData.repeat}
            onValueChange={(value) => handleInputChange('repeat', value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder="Repeat frequency" />
            </SelectTrigger>
            <SelectContent>
              {repeatOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.repeat !== 'one-time' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repeat-start">{('Repeat Start')} *</Label>
            <Input
              id="repeat-start"
              type="date"
              value={formData.repeatStart}
              onChange={(e) => handleInputChange('repeatStart', e.target.value)}
              className="shadow-soft"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeat-end">{('Repeat End')} *</Label>
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

      <div className="space-y-2">
        <Label htmlFor="income-description">{('Description')} *</Label>
        <Textarea
          id="income-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={('Where is this income from?')}
          className="shadow-soft"
          rows={3}
        />
      </div>

      <Button type="submit" variant="income" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {('Add Income')}
      </Button>
    </form>
  );
};
