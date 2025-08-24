import React from 'react';
import { useGroupedRecurringTransactions } from './useGroupedRecurringTransactions';
import { useTransactionStore } from '@/store/useTransactionStore';

export function RecurringTransactionsList() {
  const groups = useGroupedRecurringTransactions();
  const deleteByRepeatId = useTransactionStore((state) => state.deleteByRepeatId);

  if (groups.size === 0) return <p>No recurring transactions found.</p>;

  return (
    <div>
      {[...groups.entries()].map(([repeatId, txList]) => (
        <div key={repeatId} className="mb-6 p-4 border rounded">
          <h3 className="font-semibold mb-2">Recurring Series: {repeatId}</h3>
          <ul className="list-disc ml-6">
            {txList.map((tx) => (
              <li key={tx.id}>
                {tx.date}: {tx.category} — ${tx.amount.toFixed(2)} ({tx.description || '-'})
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              if (confirm('Delete this entire recurring series?')) {
                deleteByRepeatId(repeatId);
              }
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete Series
          </button>
        </div>
      ))}
    </div>
  );
}
