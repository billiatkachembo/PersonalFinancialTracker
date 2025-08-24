/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx
import React, { useEffect, useState, useRef } from 'react';
import { BackupManager } from '@/components/BackupManager';
import Settings from '@/pages/Settings';
import { User, Camera, Plus, Save } from 'lucide-react';
import { uploadToDrive } from '@/lib/googleDrive';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import Spinner from '@/components/Spinner';

// The interface for the Profile component's props
interface ProfileProps {
  onUnlock: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onUnlock }) => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicFileName, setProfilePicFileName] = useState<string>('profile-picture.png');
  const [uploading, setUploading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load saved profile data from localStorage on mount
  useEffect(() => {
    const storedPic = localStorage.getItem('profile-pic');
    const storedName = localStorage.getItem('profile-name');
    const storedEmail = localStorage.getItem('profile-email');
    if (storedPic) setProfilePic(storedPic);
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  // Handle image file selection, convert to base64, save locally and show toast
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicFile(file);
    setProfilePicFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setProfilePic(result);
      localStorage.setItem('profile-pic', result);
      toast({ title: t('profilePicSetSuccess') });

      // Automatically upload to Google Drive
      try {
        setUploading(true);
        await uploadToDrive(file, file.name);
        toast({ title: t('uploadDriveSuccess') });
      } catch {
        toast({ title: t('uploadFailed'), variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove profile picture from localStorage and state
  const handleRemovePhoto = () => {
    localStorage.removeItem('profile-pic');
    setProfilePic(null);
    setProfilePicFile(null);
    toast({ title: t('profilePicRemoved') });
  };

  // Basic email validation regex
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Save profile info to localStorage with validation and toast feedback
  const handleSave = () => {
    if (email && !validateEmail(email)) {
      toast({ title: t('invalidEmail'), variant: 'destructive' });
      return;
    }
    localStorage.setItem('profile-name', name.trim());
    localStorage.setItem('profile-email', email.trim());
    toast({ title: t('profileSaved') });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userProfile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            {/* Profile Picture and Camera Icon */}
            <div className="relative group w-32 h-32">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                  aria-label="No profile picture"
                >
                  <User size={32} />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Change profile picture"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Hidden Input for file selection */}
            <Input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            
            {profilePic && (
              <div className="w-full max-w-sm mt-4">
                <Button onClick={handleRemovePhoto} variant="ghost" className="w-full">
                  {t('removePhoto')}
                </Button>
              </div>
            )}
            
            <div className="w-full max-w-sm space-y-3 mt-6">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Your Full Name'
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Your Email'
              />
              <Button onClick={handleSave} className="w-full">
                {uploading ? <Spinner /> : t('saveChanges')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup and Settings Section */}
      <div className="w-full max-w-sm space-y-3 mt-6"></div>
        <Button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-4">
          {showSettings ? t('hideSettings') : t('openSettings')}
        </Button>
        {showSettings && (
          <div className="space-y-6">
            <Settings onUnlock={onUnlock} />
            <Card>
              <CardHeader>
                <CardTitle>{t('backup')}</CardTitle>
              </CardHeader>
              <CardContent>
                <BackupManager />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
 
  );
};

export default Profile;
