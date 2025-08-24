import React from 'react';
import { useTransactionStore, Transaction } from '@/store/useTransactionStore';

export function useGroupedRecurringTransactions() {
  const transactions = useTransactionStore((state) => state.transactions);

  const groups = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      if (tx.repeatId) {
        if (!map.has(tx.repeatId)) map.set(tx.repeatId, []);
        map.get(tx.repeatId)!.push(tx);
      }
    });

    return map;
  }, [transactions]);

  return groups;
}
