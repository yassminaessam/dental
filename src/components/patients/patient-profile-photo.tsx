'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Camera,
  Upload,
  Trash2,
  User,
  Loader2,
  ImageIcon,
} from 'lucide-react';

interface PatientProfilePhotoProps {
  patientId: string;
  patientName: string;
  currentPhotoUrl?: string;
  onPhotoUpdated?: (newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-24 h-24 text-2xl',
  xl: 'w-32 h-32 text-3xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export function PatientProfilePhoto({
  patientId,
  patientName,
  currentPhotoUrl,
  onPhotoUpdated,
  size = 'md',
  editable = true,
}: PatientProfilePhotoProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [photoUrl, setPhotoUrl] = React.useState(currentPhotoUrl);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: t('common.error'),
        description: t('patients.photo.invalid_type'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('patients.photo.file_too_large'),
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', patientId);
      formData.append('type', 'profile');

      // Upload to file API
      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const newPhotoUrl = uploadData.url;

      // Update patient record
      const updateResponse = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: newPhotoUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update patient');
      }

      setPhotoUrl(newPhotoUrl);
      onPhotoUpdated?.(newPhotoUrl);
      
      toast({
        title: t('patients.photo.upload_success'),
        description: t('patients.photo.upload_success_desc'),
      });

      // Close dialog and reset
      setDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('patients.photo.upload_error'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: null }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove photo');
      }

      setPhotoUrl(undefined);
      onPhotoUpdated?.(null);
      
      toast({
        title: t('patients.photo.removed'),
        description: t('patients.photo.removed_desc'),
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('patients.photo.remove_error'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <div
          className={cn(
            "rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary border-2 border-background shadow-lg",
            sizeClasses[size]
          )}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={patientName}
              fill
              className="object-cover"
            />
          ) : (
            <span>{getInitials(patientName)}</span>
          )}
        </div>
        
        {editable && (
          <button
            onClick={() => setDialogOpen(true)}
            className={cn(
              "absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity",
              size === 'sm' && "p-1",
              size === 'xl' && "p-2"
            )}
          >
            <Camera className={cn(
              "h-3 w-3",
              size === 'lg' && "h-4 w-4",
              size === 'xl' && "h-5 w-5"
            )} />
          </button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('patients.photo.title')}</DialogTitle>
            <DialogDescription>
              {t('patients.photo.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current/Preview Photo */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-border">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={patientName}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <Label>{t('patients.photo.select_file')}</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={uploading}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t('patients.photo.choose_file')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('patients.photo.file_requirements')}
              </p>
            </div>

            {selectedFile && (
              <div className="p-2 rounded bg-muted text-sm">
                <span className="font-medium">{t('patients.photo.selected')}:</span>{' '}
                {selectedFile.name}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {photoUrl && (
              <Button
                variant="destructive"
                onClick={handleRemovePhoto}
                disabled={uploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('patients.photo.remove')}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('common.uploading')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('patients.photo.upload')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
