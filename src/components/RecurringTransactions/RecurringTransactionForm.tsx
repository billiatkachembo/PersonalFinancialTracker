import React, { useState, useEffect } from 'react';
import { useTransactionStore, Transaction } from '@/store/useTransactionStore';
import { v4 as uuidv4 } from 'uuid';

interface RecurringFormProps {
  initialData?: Partial<Transaction>;
  onClose?: () => void;
}

export function RecurringTransactionForm({ initialData = {}, onClose }: RecurringFormProps) {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const generateRecurring = useTransactionStore((state) => state.generateRecurring);
  const updateByRepeatId = useTransactionStore((state) => state.updateByRepeatId);

  const [form, setForm] = useState({
    id: initialData.id || '',
    date: initialData.date || '',
    amount: initialData.amount || 0,
    category: initialData.category || '',
    description: initialData.description || '',
    account: initialData.account || '',
    repeat: initialData.repeat || 'monthly',
    repeatStart: initialData.repeatStart || '',
    repeatEnd: initialData.repeatEnd || '',
    repeatId: initialData.repeatId || uuidv4(),
  });

  useEffect(() => {
    if (initialData.repeatId) {
      setForm((f) => ({ ...f, ...initialData }));
    }
  }, [initialData]);

  const isEdit = Boolean(initialData.repeatId);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.amount || !form.category || !form.repeatStart || !form.repeatEnd) {
      alert('Please fill all required fields');
      return;
    }

    const baseTransaction: Transaction = {
      id: form.id || uuidv4(),
      date: form.date || form.repeatStart,
      amount: form.amount,
      category: form.category,
      description: form.description,
      account: form.account,
      repeat: form.repeat as Transaction['repeat'],
      repeatStart: form.repeatStart,
      repeatEnd: form.repeatEnd,
      repeatId: form.repeatId,
    };

    if (isEdit) {
      updateByRepeatId(form.repeatId, {
        amount: form.amount,
        category: form.category,
        description: form.description,
        account: form.account,
        repeat: form.repeat as Transaction['repeat'],
        repeatStart: form.repeatStart,
        repeatEnd: form.repeatEnd,
      });
      generateRecurring(baseTransaction);
    } else {
      addTransaction(baseTransaction);
      generateRecurring(baseTransaction);
    }

    if (onClose) onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-4 border rounded">
      <div>
        <label className="block mb-1">Amount*</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">Category*</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">Account</label>
        <input
          type="text"
          name="account"
          value={form.account}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">Start Date*</label>
        <input
          type="date"
          name="repeatStart"
          value={form.repeatStart}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">End Date*</label>
        <input
          type="date"
          name="repeatEnd"
          value={form.repeatEnd}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">Repeat Frequency*</label>
        <select
          name="repeat"
          value={form.repeat}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isEdit ? 'Update Recurring' : 'Add Recurring'}
      </button>
    </form>
  );
}
