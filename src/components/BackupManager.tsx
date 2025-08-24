/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Upload,
  Cloud,
  AlertCircle,
  HardDrive,
  RefreshCcw,
  FolderOpen,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

interface BackupManagerProps {
  autoExport?: boolean;
  userEmail?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // replace this
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // replace this
const SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const PICKER_API = 'picker';

export const BackupManager: React.FC<BackupManagerProps> = ({
  autoExport,
  userEmail,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const hasExportedRef = useRef(false);
  const oauthToken = useRef<string | null>(null);

  // Load Google API client & Picker
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = () => {
      window.gapi.load('client:auth2', initClient);
      window.gapi.load(PICKER_API, () => setPickerApiLoaded(true));
    };
    document.body.appendChild(script);

    function initClient() {
      window.gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          setGapiReady(true);
          const authInstance = window.gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen((signedIn: boolean) => {
            setIsSignedIn(signedIn);
            if (signedIn) {
              oauthToken.current =
                authInstance.currentUser.get().getAuthResponse().access_token;
              listBackupFiles();
            } else {
              oauthToken.current = null;
              setDriveFiles([]);
            }
          });
          if (authInstance.isSignedIn.get()) {
            oauthToken.current =
              authInstance.currentUser.get().getAuthResponse().access_token;
            listBackupFiles();
          }
        })
        .catch((error: any) => {
          console.error('Google API init error', error);
          toast({
            title: 'Google API Initialization Failed',
            description: 'Failed to load Google Drive integration.',
            variant: 'destructive',
          });
        });
    }
  }, [toast]);

  // Sign in/out handlers
  const handleSignIn = () => {
    if (!gapiReady) return;
    window.gapi.auth2.getAuthInstance().signIn();
  };
  const handleSignOut = () => {
    if (!gapiReady) return;
    window.gapi.auth2.getAuthInstance().signOut();
  };

  // List backup files on Drive
  const listBackupFiles = () => {
    if (!gapiReady) return;
    window.gapi.client.drive.files
      .list({
        pageSize: 10,
        fields: 'files(id, name, createdTime)',
        q: "mimeType='application/json' and name contains 'finance-backup'",
        orderBy: 'createdTime desc',
      })
      .then((response: any) => {
        setDriveFiles(response.result.files || []);
      })
      .catch((error: any) => {
        toast({
          title: t('error') || 'Error',
          description:
            t('failedToListBackups') || 'Failed to list backup files from Google Drive.',
          variant: 'destructive',
        });
        console.error(error);
      });
  };

  // Upload backup to Google Drive
  const uploadBackupToDrive = () => {
    if (!gapiReady) {
      toast({
        title: t('googleApiNotReady') || 'Google API Not Ready',
        description: t('tryAgainLater') || 'Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    setIsExporting(true);

    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const income = JSON.parse(localStorage.getItem('income') || '[]');
      const notes = JSON.parse(localStorage.getItem('finance-notes') || '[]');
      const passcodes = JSON.parse(localStorage.getItem('passcodes') || '[]');
      const profilePic = localStorage.getItem('profile-pic') || null;
      const profileName = localStorage.getItem('profile-name') || '';
      const profileEmail = localStorage.getItem('profile-email') || '';
      const settings = {
        language: localStorage.getItem('language'),
        currency: localStorage.getItem('currency'),
        theme: localStorage.getItem('vite-ui-theme'),
      };

      const backupData = {
        expenses,
        income,
        notes,
        passcodes,
        profile: { profilePic, profileName, profileEmail },
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0',
        userEmail,
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata = {
        name: `finance-backup-${new Date()
          .toISOString()
          .split('T')[0]}.json`,
        mimeType: 'application/json',
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(backupData) +
        closeDelimiter;

      window.gapi.client
        .request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body: multipartRequestBody,
        })
        .then(
          () => {
            toast({
              title: t('exportSuccessful') || 'Export Successful',
              description:
                t('exportSuccessDesc') || 'Backup uploaded to Google Drive successfully.',
            });
            setIsExporting(false);
            listBackupFiles();
            hasExportedRef.current = true;
          },
          (error: any) => {
            toast({
              title: t('exportFailed') || 'Export Failed',
              description:
                t('exportFailedDesc') || 'Failed to upload backup to Google Drive.',
              variant: 'destructive',
            });
            setIsExporting(false);
            console.error('Google Drive upload error', error);
          }
        );
    } catch (error) {
      toast({
        title: t('exportFailed') || 'Export Failed',
        description: t('exportFailedDesc') || 'Failed to prepare backup data.',
        variant: 'destructive',
      });
      setIsExporting(false);
      console.error(error);
    }
  };

  // Download and import backup from Drive
  const downloadFromDrive = (fileId: string, fileName: string) => {
    setIsImporting(true);
    window.gapi.client.drive.files
      .get({ fileId, alt: 'media' })
      .then((response: any) => {
        const dataStr = response.body || JSON.stringify(response.result);
        const backupData = JSON.parse(dataStr);

        if (backupData.expenses)
          localStorage.setItem('expenses', JSON.stringify(backupData.expenses));
        if (backupData.income)
          localStorage.setItem('income', JSON.stringify(backupData.income));
        if (backupData.notes)
          localStorage.setItem('finance-notes', JSON.stringify(backupData.notes));
        if (backupData.passcodes)
          localStorage.setItem('passcodes', JSON.stringify(backupData.passcodes));
        if (backupData.profile) {
          const { profilePic, profileName, profileEmail } = backupData.profile;
          if (profilePic) localStorage.setItem('profile-pic', profilePic);
          if (profileName) localStorage.setItem('profile-name', profileName);
          if (profileEmail) localStorage.setItem('profile-email', profileEmail);
        }
        if (backupData.settings) {
          if (backupData.settings.language)
            localStorage.setItem('language', backupData.settings.language);
          if (backupData.settings.currency)
            localStorage.setItem('currency', backupData.settings.currency);
          if (backupData.settings.theme)
            localStorage.setItem('vite-ui-theme', backupData.settings.theme);
        }

        toast({
          title: t('importSuccessful') || 'Import Successful',
          description:
            t('importSuccessDesc') ||
            `Backup "${fileName}" imported successfully. Please refresh the page.`,
        });
      })
      .catch((error: any) => {
        toast({
          title: t('importFailed') || 'Import Failed',
          description:
            t('importFailedDesc') ||
            'Failed to download or import backup from Google Drive.',
          variant: 'destructive',
        });
        console.error(error);
      })
      .finally(() => {
        setIsImporting(false);
      });
  };

  // Google Picker to select backup files from Drive
  const openPicker = () => {
    if (!pickerApiLoaded || !oauthToken.current) {
      toast({
        title: t('pickerNotReady') || 'Picker Not Ready',
        description: t('signInFirst') || 'Please sign in to Google Drive first.',
        variant: 'destructive',
      });
      return;
    }

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    view.setMimeTypes('application/json');
    view.setSelectFolderEnabled(false);
    view.setIncludeFolders(false);
    view.setQuery('finance-backup');

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken.current)
      .setDeveloperKey(API_KEY)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          if (file && file.id) {
            downloadFromDrive(file.id, file.name);
          }
        }
      })
      .build();

    picker.setVisible(true);
  };

  // Export data to CSV + JSON and trigger downloads
  const exportToCSV = () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const income = JSON.parse(localStorage.getItem('income') || '[]');
      const notes = JSON.parse(localStorage.getItem('finance-notes') || '[]');
      const passcodes = JSON.parse(localStorage.getItem('passcodes') || '[]');
      const profilePic = localStorage.getItem('profile-pic') || null;
      const profileName = localStorage.getItem('profile-name') || '';
      const profileEmail = localStorage.getItem('profile-email') || '';
      const settings = {
        language: localStorage.getItem('language'),
        currency: localStorage.getItem('currency'),
        theme: localStorage.getItem('vite-ui-theme'),
      };

      const csvContent = [
        'Type,Date,Amount,Category,Description,Account',
        ...expenses.map((exp: any) =>
          `Expense,${exp.date},${exp.amount},${exp.category},"${exp.description}",${exp.account || ''}`
        ),
        ...income.map((inc: any) =>
          `Income,${inc.date},${inc.amount},${inc.category},"${inc.description}",${inc.account || ''}`
        ),
      ].join('\n');

      const backupData = {
        expenses,
        income,
        notes,
        passcodes,
        profile: {
          profilePic,
          profileName,
          profileEmail,
        },
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0',
        userEmail,
      };

      // Trigger CSV download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-backup-${new Date()
        .toISOString()
        .split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Trigger JSON download
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const jsonUrl = window.URL.createObjectURL(jsonBlob);
      const jsonA = document.createElement('a');
      jsonA.href = jsonUrl;
      jsonA.download = `finance-backup-${new Date()
        .toISOString()
        .split('T')[0]}.json`;
      jsonA.click();
      window.URL.revokeObjectURL(jsonUrl);

      toast({
        title: t('exportSuccessful') || 'Export Successful',
        description: t('exportSuccessDesc') || 'Your data has been exported successfully.',
      });

      hasExportedRef.current = true;
    } catch {
      toast({
        title: t('exportFailed') || 'Export Failed',
        description:
          t('exportFailedDesc') || 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import data from selected file (CSV or JSON)
  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (file.name.endsWith('.json')) {
          const backupData = JSON.parse(content);

          if (backupData.expenses)
            localStorage.setItem('expenses', JSON.stringify(backupData.expenses));
          if (backupData.income)
            localStorage.setItem('income', JSON.stringify(backupData.income));
          if (backupData.notes)
            localStorage.setItem('finance-notes', JSON.stringify(backupData.notes));
          if (backupData.passcodes)
            localStorage.setItem('passcodes', JSON.stringify(backupData.passcodes));
          if (backupData.profile) {
            const { profilePic, profileName, profileEmail } = backupData.profile;
            if (profilePic) localStorage.setItem('profile-pic', profilePic);
            if (profileName) localStorage.setItem('profile-name', profileName);
            if (profileEmail) localStorage.setItem('profile-email', profileEmail);
          }
          if (backupData.settings) {
            if (backupData.settings.language)
              localStorage.setItem('language', backupData.settings.language);
            if (backupData.settings.currency)
              localStorage.setItem('currency', backupData.settings.currency);
            if (backupData.settings.theme)
              localStorage.setItem('vite-ui-theme', backupData.settings.theme);
          }

          toast({
            title: t('importSuccessful') || 'Import Successful',
            description:
              t('importSuccessDesc') ||
              'Your data has been imported successfully. Please refresh the page.',
          });
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const expenses: any[] = [];
          const income: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const [type, date, amount, category, description, account] =
              line.split(',');

            const transaction = {
              date,
              amount: parseFloat(amount),
              category,
              description: description?.replace(/(^"|"$)/g, '') || '',
              account: account || '',
            };

            if (type === 'Expense') expenses.push(transaction);
            else if (type === 'Income') income.push(transaction);
          }

          localStorage.setItem('expenses', JSON.stringify(expenses));
          localStorage.setItem('income', JSON.stringify(income));

          toast({
            title: t('importSuccessful') || 'Import Successful',
            description:
              t('importSuccessDesc') ||
              'Your CSV data has been imported successfully. Please refresh the page.',
          });
        } else {
          toast({
            title: t('importFailed') || 'Import Failed',
            description: t('unsupportedFileFormat') || 'Unsupported file format.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: t('importFailed') || 'Import Failed',
          description: t('importFailedDesc') || 'Failed to import data. Please check the file and try again.',
          variant: 'destructive',
        });
        console.error(error);
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {t('backupData') || 'Backup Data'}
          </CardTitle>
          <CardDescription>
            {t('backupDataDescription') || 'Export and import your financial data'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('backupWarning') ||
                'Backup includes all your transactions, notes, passcodes, profile info, and settings. Keep your backups secure.'}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('exportData') || 'Export Data'}</CardTitle>
                <CardDescription>
                  {t('exportDataDescription') ||
                    'Download your data as CSV or JSON file'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={exportToCSV}
                  disabled={isExporting}
                  className="w-full mb-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? t('exporting') || 'Exporting...' : t('exportToFile') || 'Export to CSV & JSON'}
                </Button>
                <Button
                  onClick={uploadBackupToDrive}
                  disabled={isExporting}
                  className="w-full mb-2"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  {isExporting ? t('exporting') || 'Exporting...' : t('backupToGoogleDrive') || 'Backup to Google Drive'}
                </Button>
                {isSignedIn && (
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full mb-4"
                  >
                    {t('signOutFromGoogle') || 'Sign Out from Google'}
                  </Button>
                )}
                {!isSignedIn && (
                  <Button
                    onClick={handleSignIn}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    {t('signInToGoogleDrive') || 'Sign In to Google Drive'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Import Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('importData') || 'Import Data'}</CardTitle>
                <CardDescription>
                  {t('importDataDescription') ||
                    'Import data from CSV or JSON file or Google Drive'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept=".csv,.json"
                  id="fileInput"
                  onChange={importFromFile}
                  disabled={isImporting}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer block w-full mb-2"
                >
                                  <Button
                  className="w-full"
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? t('importing') || 'Importing...' : t('importFromFile') || 'Import from File'}
                </Button>

                </label>
                <Button
                  onClick={openPicker}
                  disabled={!isSignedIn || isImporting}
                  variant="outline"
                  className="w-full"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {t('restoreFromDrivePicker') || 'Restore from Google Drive Picker'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Optional: List of backups on Drive */}
          {driveFiles.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('backupsOnDrive') || 'Backups on Google Drive'}</CardTitle>
                  <CardDescription>
                    {t('selectBackupToRestore') ||
                      'Select a backup file to restore your data'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 max-h-48 overflow-auto">
                    {driveFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex justify-between items-center border rounded p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>{file.name}</span>
                        <Button
                          size="sm"
                          onClick={() => downloadFromDrive(file.id, file.name)}
                          disabled={isImporting}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          {t('restore') || 'Restore'}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
