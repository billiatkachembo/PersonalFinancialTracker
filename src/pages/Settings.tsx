import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { PasscodeManager } from '@/components/PasscodeManager';
import { BackupManager } from '@/components/BackupManager';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// Define the type for the props that the Settings component expects.
// The 'onUnlock' prop is required.
interface SettingsProps {
  onUnlock: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onUnlock }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showBackup, setShowBackup] = useState(false);

  return (
    <div className="space-y-6">
      {/* Security and Appearance Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings')}</CardTitle>
          <CardDescription>
            {t('manageAppSecuritySettings')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Passcode Manager - now correctly passes the onUnlock prop */}
          <PasscodeManager onUnlock={onUnlock} />
        </CardContent>
      </Card>

      {/* Backup Manager Toggle */}
       <div className="w-full max-w-sm space-y-3 mt-6"></div>
      <Card>
        <CardHeader>
          <CardTitle>{t('backupAndRestore')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button  className="flex items-center gap-4"
            onClick={() => setShowBackup(!showBackup)}>
               Backup and Restore Manager
            
            {showBackup ? t('hideBackupManager') : t('openBackupManager')}
          </Button>
          {showBackup && <BackupManager />}
        </CardContent>
      </Card>
    </div>
  
  );
};

export default Settings;

 