import React from 'react';
import { useTransferStore, Transfer } from '@/store/transferStore';
import { Trash2, Repeat2 } from 'lucide-react';

export const TransferList: React.FC = () => {
  const { transfers, deleteTransfer } = useTransferStore();

  return (
    <div className="space-y-4">
      {transfers.map((t: Transfer, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 border rounded shadow-sm hover:shadow-md transition"
        >
          <div className="flex flex-col">
            <span>
              {t.date} — {t.fromAccount} → {t.toAccount} : {t.amount}
            </span>
            <span className="text-sm text-muted-foreground">{t.description}</span>
            {t.repeat && (
              <span className="text-xs text-blue-600 flex items-center mt-1">
                <Repeat2 className="h-3 w-3 mr-1" /> {t.repeat} {t.repeatStart} → {t.repeatEnd}
              </span>
            )}
          </div>
          <button
            onClick={() => deleteTransfer(index)}
            className="p-1 rounded hover:bg-red-100 transition"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      ))}
      {transfers.length === 0 && <p className="text-center text-muted-foreground">No transfers yet</p>}
    </div>
  );
};
