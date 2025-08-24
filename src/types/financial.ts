// src/types/financial.ts
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  account?: string;
  type: 'expense' | 'income';
}

export interface TransferData {
  date: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  description: string;
}

// Additional financial types you might need
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  spent: number;
}