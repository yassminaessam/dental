/* eslint-disable no-inline-styles */
/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface IconPickerProps {
  value: string;
  uploadedIcon?: string;
  onChange: (iconName: string, uploadedUrl?: string) => void;
  size?: string;
  color?: string;
}

// Popular icons to show in the picker
const popularIcons = [
  'Home', 'User', 'Settings', 'Search', 'Mail', 'Phone', 'MapPin', 'Calendar',
  'Clock', 'Heart', 'Star', 'ShoppingCart', 'Menu', 'X', 'Check', 'AlertCircle',
  'Info', 'HelpCircle', 'Globe', 'Link', 'Download', 'Upload', 'Share2', 'Copy',
  'Trash2', 'Edit', 'Save', 'Plus', 'Minus', 'ChevronRight', 'ChevronLeft',
  'ChevronUp', 'ChevronDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
  'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github',
  'Sun', 'Moon', 'Cloud', 'Zap', 'Bell', 'Lock', 'Unlock', 'Eye', 'EyeOff',
  'Camera', 'Image', 'Video', 'Mic', 'Volume2', 'VolumeX', 'Wifi', 'WifiOff',
  'Battery', 'BatteryCharging', 'Bluetooth', 'Database', 'HardDrive', 'Cpu',
  'Monitor', 'Smartphone', 'Tablet', 'Laptop', 'Watch', 'Tv', 'Printer',
  'Bookmark', 'Tag', 'Flag', 'Folder', 'File', 'FileText', 'BarChart',
  'PieChart', 'LineChart', 'TrendingUp', 'TrendingDown', 'DollarSign', 'CreditCard',
  'Gift', 'Package', 'ShoppingBag', 'Percent', 'Hash', 'AtSign'
];

export function IconPicker({
  value,
  uploadedIcon,
  onChange,
  size = '1.5rem',
  color = '#000000'
}: IconPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Filter icons based on search
  const filteredIcons = popularIcons.filter(iconName =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the current icon component
  const getCurrentIcon = () => {
    if (uploadedIcon) {
      return (
        <img
          src={uploadedIcon}
          alt="Custom icon"
          style={{ width: size, height: size }}
        />
      );
    }
    
    const IconComponent = (Icons as any)[value];
    if (IconComponent) {
      return <IconComponent style={{ width: size, height: size, color }} />;
    }
    
    return <Icons.HelpCircle style={{ width: size, height: size, color }} />;
  };

  const handleIconSelect = (iconName: string) => {
    onChange(iconName, '');
    setIsOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('svg') && !file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an SVG or image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 1MB for icons)
    if (file.size > 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Icon files should be smaller than 1MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'icons');

      const response = await fetch('/api/website-builder/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange('custom', data.url);
      setIsOpen(false);
      
      toast({
        title: 'Upload successful',
        description: 'Icon has been uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload icon. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Icon</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
          >
            {getCurrentIcon()}
            <span className="flex-1 text-left">
              {uploadedIcon ? 'Custom Icon' : value || 'Select Icon'}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="library" className="flex-1">Icon Library</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">Upload Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="library" className="p-3">
              <div className="space-y-3">
                <Input
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
                
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-6 gap-2">
                    {filteredIcons.map((iconName) => {
                      const IconComponent = (Icons as any)[iconName];
                      if (!IconComponent) return null;
                      
                      return (
                        <Button
                          key={iconName}
                          variant={value === iconName ? 'default' : 'ghost'}
                          size="sm"
                          className="h-10 w-10 p-0"
                          onClick={() => handleIconSelect(iconName)}
                          title={iconName}
                        >
                          <IconComponent className="h-5 w-5" />
                        </Button>
                      );
                    })}
                  </div>
                  {filteredIcons.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No icons found
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Icons.Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a custom SVG or image icon
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    variant="outline"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload custom icon file"
                  />
                </div>
                
                {uploadedIcon && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <img
                        src={uploadedIcon}
                        alt="Custom icon"
                        className="h-8 w-8"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onChange('Home', '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      
      {/* Icon URL Input */}
      {uploadedIcon && (
        <Input
          value={uploadedIcon}
          onChange={(e) => onChange('custom', e.target.value)}
          placeholder="Icon URL"
          className="text-xs"
        />
      )}
    </div>
  );
}
