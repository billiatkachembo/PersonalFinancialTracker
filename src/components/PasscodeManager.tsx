import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Check, Key, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface PasscodeManagerProps {
  onUnlock: () => void;
  onFail?: () => void; // optional, or remove ? to make it required
}


export const PasscodeManager: React.FC<PasscodeManagerProps> = ({ onUnlock }) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    setIsEnabled(localStorage.getItem('app-passcode') !== null);
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
      } catch {
        setIsBiometricAvailable(false);
      }
    }
  };

  const handleUnlock = () => {
    const stored = localStorage.getItem('app-passcode');
    if (!stored) {
      setUnlockError(t('noPasscodeSet'));
      return;
    }

    const decoded = atob(stored);
    if (unlockPasscode === decoded) {
      sessionStorage.setItem('app-authenticated', 'true');
      setUnlockError('');
      setUnlockPasscode('');
      onUnlock();
    } else {
      setUnlockError(t('incorrectPasscode'));
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'required',
        },
      });

      if (assertion) {
        toast({ title: t('biometricSuccess') });
        onUnlock();
      }
    } catch {
      toast({ title: t('biometricFailed'), variant: 'destructive' });
    }
  };

  const handleEnablePasscode = () => {
    if (!newPasscode || newPasscode !== confirmPasscode) {
      toast({
        title: t('error'),
        description: t('passcodesDontMatchOrEmpty'),
        variant: 'destructive',
      });
      return;
    }

    if (newPasscode.length < 4) {
      toast({
        title: t('error'),
        description: t('passcodeMinLength'),
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('app-passcode', btoa(newPasscode));
    setIsEnabled(true);
    setNewPasscode('');
    setConfirmPasscode('');

    toast({
      title: t('passcodeEnabled'),
      description: t('passcodeEnabledDescription'),
    });
  };

  const handleChangePasscode = () => {
    const stored = localStorage.getItem('app-passcode');
    if (!stored) return;

    const decoded = atob(stored);
    if (currentPasscode !== decoded) {
      toast({
        title: t('error'),
        description: t('currentPasscodeIncorrect'),
        variant: 'destructive',
      });
      return;
    }

    if (!newPasscode || newPasscode !== confirmPasscode) {
      toast({
        title: t('error'),
        description: t('newPasscodesDontMatchOrEmpty'),
        variant: 'destructive',
      });
      return;
    }

    if (newPasscode.length < 4) {
      toast({
        title: t('error'),
        description: t('passcodeMinLength'),
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('app-passcode', btoa(newPasscode));
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setIsChanging(false);

    toast({
      title: t('passcodeChanged'),
      description: t('passcodeChangedDescription'),
    });
  };

  const handleDisablePasscode = () => {
    if (
      !currentPasscode ||
      atob(localStorage.getItem('app-passcode') || '') !== currentPasscode
    ) {
      toast({
        title: t('error'),
        description: t('currentPasscodeIncorrect'),
        variant: 'destructive',
      });
      return;
    }

    localStorage.removeItem('app-passcode');
    sessionStorage.removeItem('app-authenticated');
    setIsEnabled(false);
    setCurrentPasscode('');

    toast({
      title: t('passcodeDisabled'),
      description: t('passcodeDisabledDescription'),
    });
  };

  const isAuthenticated = sessionStorage.getItem('app-authenticated');

  // Show unlock screen if passcode is enabled but user not authenticated
  if (isEnabled && !isAuthenticated) {
    return (
      <Card className="max-w-sm mx-auto mt-6">
        <CardHeader>
          <CardTitle>{t('unlockApp')}</CardTitle>
          <CardDescription>{t('enterPasscodeToContinue')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type={showPasscodes ? 'text' : 'password'}
            placeholder={t('enterPasscode') || 'Enter your 4-digit passcode'}
            value={unlockPasscode}
            onChange={(e) => setUnlockPasscode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
            className="text-foreground"
          />
          {unlockError && <p className="text-destructive">{unlockError}</p>}

     <div className="flex flex-col space-y-2">
  <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleUnlock}>
    {t('unlock')}
  </Button>

 <Button
  variant="outline"
  onClick={handleBiometricUnlock}
  className="text-sm font-medium text-muted-foreground dark:text-muted flex items-center justify-center"
>
  {t('unlockWithBiometrics')}
</Button>


</div>


        </CardContent>
      </Card>
    );
  }

  // Main passcode management UI when enabled or disabled and user authenticated
  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-foreground">{t('passcodeSettings')}</CardTitle>
        <CardDescription className="text-muted-foreground">{t('secureAppWithPasscode')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEnabled ? (
          <>
            <Input
              type="password"
              placeholder={t('newPasscode') || 'Enter new 4-digit passcode'}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="text-foreground"
              minLength={4}
            />
            <Input
              type="password"
              placeholder={t('confirmPasscode') || 'Confirm new passcode'}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="text-foreground"
              minLength={4}
            />
            <Button className="w-full" onClick={handleEnablePasscode}>
              <Check className="mr-2 w-4 h-4" />
              {t('enablePasscode')}
            </Button>
          </>
        ) : isChanging ? (
          <>
            <Input
              type="password"
              placeholder={t('currentPasscode') || 'Enter current passcode'}
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              className="text-foreground"
            />
            <Input
              type="password"
              placeholder={t('newPasscode') || 'Enter new 4-digit passcode'}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="text-foreground"
              minLength={4}
            />
            <Input
              type="password"
              placeholder={t('confirmPasscode') || 'Confirm new passcode'}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="text-foreground"
              minLength={4}
            />
            <Button className="w-full" onClick={handleChangePasscode}>
              <Check className="mr-2 w-4 h-4" />
              {t('saveChanges')}
            </Button>
          </>
        ) : (
          <>
            <Input
              type="password"
              placeholder={t('currentPasscode') || 'Enter current passcode'}
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              className="text-foreground"
            />
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="default" onClick={() => setIsChanging(true)} className="text-sm font-medium text-muted-foreground dark:text-muted flex items-center justify-center">
                <Key className="mr-2 w-4 h-4" />
                {t('changePasscode')}
              </Button>
             <Button
  variant="destructive"
  onClick={() => {
    if (window.confirm(t('confirmDisablePasscode'))) {
      handleDisablePasscode();
    }
  }}
  className="text-destructive-foreground flex items-center justify-center"
>
  <Trash2 className="mr-2 w-4 h-4" />
  {t('disablePasscode')}
</Button>

            </div>
          </>
        )}
        
      </CardContent>
    </Card>
  );
};
