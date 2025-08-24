import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { Repeat2, Calculator as CalculatorIcon } from 'lucide-react';
import { useTransferStore } from '@/store/transferStore';

type RepeatOption = "One-time" | "Daily" | "Weekly" | "Monthly" | "Yearly";

interface TransferFormData {
  date: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  description: string;
  repeat: RepeatOption;
  repeatStart?: string;
  repeatEnd?: string;
}

interface TransferFormProps {
  onSubmit: (transfer: TransferFormData) => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const { currencies, currency } = useCurrency();
  const { toast } = useToast();
  const addTransfer = useTransferStore(state => state.addTransfer);

  const [formData, setFormData] = useState<TransferFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    fromAccount: '',
    toAccount: '',
    description: '',
    repeat: 'One-time',
    repeatStart: '',
    repeatEnd: '',
  });

  // Calculator State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcExpression, setCalcExpression] = useState<string>('');

  const accountOptions = [
    { value: 'Cash', label: ('Cash'), icon: '💵' },
    { value: 'Bank', label: ('Bank'), icon: '🏦' },
    { value: 'Credit Card', label: ('Credit Card'), icon: '💳' },
    { value: 'Debit Card', label: ('Debit Card'), icon: '🏧' },
    { value: 'Mobile Money', label: ('Mobile Money'), icon: '📱' },
  ];

  const repeatOptions: { value: RepeatOption; label: string }[] = [
    { value: 'One-time', label: ('One-time') },
    { value: 'Daily', label: ('Daily') },
    { value: 'Weekly', label: ('Weekly') },
    { value: 'Monthly', label: ('Monthly') },
    { value: 'Yearly', label: ('Yearly') },
  ];

  const handleInputChange = (field: keyof TransferFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInterval = (date: Date, repeat: RepeatOption) => {
    const newDate = new Date(date);
    switch (repeat) {
      case 'Daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'Weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'Monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'Yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    return newDate;
  };

  // Calculator Logic
  const handleCalcCharClick = (char: string) => {
    const lastChar = calcExpression.slice(-1);
    const operators = ['+', '-', '*', '/'];

    if (operators.includes(char) && operators.includes(lastChar)) return;
    if (char === '.' && calcExpression.includes('.')) {
      const lastNumber = calcExpression.split(/[-+*/]/).pop() || '';
      if (lastNumber.includes('.')) return;
    }

    setCalcExpression(prev => prev + char);
  };

  const handleCalculate = () => {
    try {
      const result = new Function('return ' + calcExpression)();
      const roundedResult = parseFloat(result.toFixed(2));
      handleInputChange('amount', roundedResult);
      setCalcExpression('');
      setIsCalculatorOpen(false);
    } catch (e) {
      toast({
        title: t('Error'),
        description: t('Invalid calculation') || 'Invalid calculation',
        variant: 'destructive',
      });
      setCalcExpression('');
    }
  };

  const handleClear = () => {
    setCalcExpression('');
    handleInputChange('amount', 0);
  };

  const handleDelete = () => {
    setCalcExpression(prev => prev.slice(0, -1));
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCalcExpression(value);
    handleInputChange('amount', parseFloat(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { amount, fromAccount, toAccount, description, repeat, repeatStart, repeatEnd, date } = formData;

    if (!amount || !fromAccount || !toAccount || !description) {
      toast({ title: t('Error'), description: t('Please fill in all required fields'), variant: 'destructive' });
      return;
    }
    if (amount <= 0) {
      toast({ title: t('Error'), description: t('Amount must be greater than 0'), variant: 'destructive' });
      return;
    }
    if (fromAccount === toAccount) {
      toast({ title: t('Error'), description: t('Cannot transfer to the same account'), variant: 'destructive' });
      return;
    }

    if (repeat !== 'One-time') {
      if (!repeatStart || !repeatEnd) {
        toast({ title: t('Error'), description: t('Please select repeat start and end dates'), variant: 'destructive' });
        return;
      }
      if (repeatEnd < repeatStart) {
        toast({ title: t('Error'), description: t('Repeat end date cannot be before start date'), variant: 'destructive' });
        return;
      }

      let currentDate = new Date(repeatStart);
      const finalDate = new Date(repeatEnd);
      while (currentDate <= finalDate) {
        addTransfer({
          date: currentDate.toISOString().split('T')[0],
          amount,
          fromAccount,
          toAccount,
          description,
          repeat,
          repeatStart,
          repeatEnd,
        });
        currentDate = addInterval(currentDate, repeat);
      }
    } else {
      addTransfer({ date, amount, fromAccount, toAccount, description, repeat });
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      fromAccount: '',
      toAccount: '',
      description: '',
      repeat: 'One-time',
      repeatStart: '',
      repeatEnd: '',
    });

    setCalcExpression('');
    toast({ title: t('Success'), description: t('Transfer successful!'), variant: 'default' });
    onSubmit(formData);
  };

  const getAccountLabel = (value: string) => {
    const opt = accountOptions.find(o => o.value === value);
    return opt ? `${opt.icon} ${opt.label}` : t('Select account');
  };

  const getRepeatLabel = (value: RepeatOption) => {
    const opt = repeatOptions.find(o => o.value === value);
    return opt ? opt.label : t('Repeat frequency');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('Date')}</Label>
          <Input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} className="shadow-soft" />
        </div>

        <div className="space-y-2">
          <Label>{t('Amount')} ({currencies[currency]?.symbol}) *</Label>
          <div className="flex relative">
            <Input
              type="text"
              value={calcExpression || (formData.amount > 0 ? formData.amount : '')}
              onChange={handleAmountInput}
              placeholder="0.00"
              className="shadow-soft pr-10 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCalculatorOpen(!isCalculatorOpen);
                if (!isCalculatorOpen && formData.amount > 0) setCalcExpression(formData.amount.toString());
                else if (!isCalculatorOpen && formData.amount === 0) setCalcExpression('');
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <CalculatorIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {isCalculatorOpen && (
            <div  className="inline top-16 right-10 w-64 p-2 rounded-lg shadow-md bg-background text-foreground z-50">

              <div className="mb-2 text-right font-mono select-One-time border-b-2 pb-1 border-gray-200">
                {calcExpression || formData.amount || '0'}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','DEL','+','.','='].map(char => (
                  <Button
                    key={char}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (char === '=') handleCalculate();
                      else if (char === 'C') handleClear();
                      else if (char === 'DEL') handleDelete();
                      else handleCalcCharClick(char);
                    }}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{('Transfer From Account')}</Label>
          <Select value={formData.fromAccount} onValueChange={v => handleInputChange('fromAccount', v)}>
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={('Select Account')}>{getAccountLabel(formData.fromAccount)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{('Transfer To Account')}</Label>
          <Select value={formData.toAccount} onValueChange={v => handleInputChange('toAccount', v)}>
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder={('Select Account')}>{getAccountLabel(formData.toAccount)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{('Repeat')}</Label>
        <Select value={formData.repeat} onValueChange={v => handleInputChange('repeat', v as RepeatOption)}>
          <SelectTrigger className="shadow-soft">
            <SelectValue>{getRepeatLabel(formData.repeat)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {repeatOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {formData.repeat !== 'One-time' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{('Repeat Start')}</Label>
            <Input type="date" value={formData.repeatStart} onChange={e => handleInputChange('repeatStart', e.target.value)} className="shadow-soft" />
          </div>
          <div className="space-y-2">
            <Label>{('Repeat End')}</Label>
            <Input type="date" value={formData.repeatEnd} onChange={e => handleInputChange('repeatEnd', e.target.value)} className="shadow-soft" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{('Description')}</Label>
        <Textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder={('Reason for transfer')} className="shadow-soft" rows={3} />
      </div>

      <Button type="submit" variant="default" className="w-full">
        <Repeat2 className="h-4 w-4 mr-2" />
        {('Transfer Funds')}
      </Button>
    </form>
  );
};
