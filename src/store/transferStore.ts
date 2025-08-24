/* eslint-disable prefer-const */
import { create } from 'zustand';

export interface Transfer {
  date: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  description: string;
  repeat?: 'One-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  repeatStart?: string;
  repeatEnd?: string;
}


interface TransferStore {
  transfers: Transfer[];
  addTransfer: (transfer: Transfer) => void;
  deleteTransfer: (index: number) => void;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  transfers: JSON.parse(localStorage.getItem('transfers') || '[]'),
  
  addTransfer: (transfer: Transfer) => {
    const newTransfers = [...get().transfers];
    
    // Add main transfer
    newTransfers.push(transfer);

    // Auto-generate recurring transfers if applicable
    if (transfer.repeat && transfer.repeatStart && transfer.repeatEnd) {
      const start = new Date(transfer.repeatStart);
      const end = new Date(transfer.repeatEnd);
      let current = new Date(start);

      const increment = () => {
        switch (transfer.repeat) {
          case 'Daily': current.setDate(current.getDate() + 1); break;
          case 'Weekly': current.setDate(current.getDate() + 7); break;
          case 'Monthly': current.setMonth(current.getMonth() + 1); break;
          case 'Yearly': current.setFullYear(current.getFullYear() + 1); break;
        }
      };

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (dateStr !== transfer.date) {
          newTransfers.push({ ...transfer, date: dateStr });
        }
        increment();
      }
    }

    set({ transfers: newTransfers });
    localStorage.setItem('transfers', JSON.stringify(newTransfers));
  },

  deleteTransfer: (index: number) => {
    const newTransfers = [...get().transfers];
    newTransfers.splice(index, 1);
    set({ transfers: newTransfers });
    localStorage.setItem('transfers', JSON.stringify(newTransfers));
  },
}));
