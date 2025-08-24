/* eslint-disable prefer-const */
// src/store/useTransactionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  account: string;
  repeat?: RepeatFrequency;
  repeatStart?: string;
  repeatEnd?: string;
  repeatId?: string;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  generateRecurring: (tx: Transaction) => void;
  deleteByRepeatId: (repeatId: string) => void;
  updateByRepeatId: (repeatId: string, changes: Partial<Transaction>) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        set((state) => ({
          transactions: [...state.transactions, tx],
        }));
      },

      generateRecurring: (tx) => {
        if (!tx.repeat || !tx.repeatStart || !tx.repeatEnd) return;

        const existing = new Set(
          get().transactions
            .filter((t) => t.repeatId === tx.repeatId)
            .map((t) => t.date)
        );

        const result: Transaction[] = [];
        const start = new Date(tx.repeatStart);
        const end = new Date(tx.repeatEnd);
        let current = new Date(start);

        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          if (!existing.has(dateStr)) {
            result.push({
              ...tx,
              id: `${tx.repeatId}-${dateStr}`,
              date: dateStr,
            });
          }

          switch (tx.repeat) {
            case 'daily':
              current.setDate(current.getDate() + 1);
              break;
            case 'weekly':
              current.setDate(current.getDate() + 7);
              break;
            case 'monthly':
              current.setMonth(current.getMonth() + 1);
              break;
            case 'yearly':
              current.setFullYear(current.getFullYear() + 1);
              break;
          }
        }

        set((state) => ({
          transactions: [...state.transactions, ...result],
        }));
      },

      deleteByRepeatId: (repeatId) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.repeatId !== repeatId),
        }));
      },

      updateByRepeatId: (repeatId, changes) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.repeatId === repeatId ? { ...tx, ...changes } : tx
          ),
        }));
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);
