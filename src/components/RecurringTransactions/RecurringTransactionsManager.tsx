import React, { useState } from 'react';
import { RecurringTransactionsList } from './RecurringTransactionsList';
import { RecurringTransactionForm } from './RecurringTransactionForm';

export function RecurringTransactionsManager() {
  const [editingRepeatId, setEditingRepeatId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Recurring Transactions</h2>

      <RecurringTransactionForm
        key={editingRepeatId || 'new'}
        initialData={undefined /* extend this if you want to load editing data */}
        onClose={() => setEditingRepeatId(null)}
      />

      <hr className="my-6" />

      <RecurringTransactionsList />
    </div>
  );
}
