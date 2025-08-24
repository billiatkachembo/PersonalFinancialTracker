import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PasscodeManager } from './PasscodeManager';

interface SecurityDialogProps {
  open: boolean;
  onClose: () => void;
}

const SecurityDialog: React.FC<SecurityDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full max-h-full p-6 sm:p-8 overflow-auto">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🔐 Passcode Manager</h2>
            <button onClick={onClose} className="text-sm underline" aria-label="Close dialog">
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <PasscodeManager
              onUnlock={() => {
                console.log('Unlocked');
                onClose();
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityDialog;
