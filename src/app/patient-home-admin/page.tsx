'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientHomeAdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/patient-portal?tab=content-admin');
  }, [router]);
  return null;
}
/*
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, Eye, Globe, Gift, Users, MessageSquare, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Use client data layer to ensure array shape and avoid server-only imports in client components
import { listDocuments, setDocument, deleteDocument } from '@/lib/data-client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code: string;
  featured: boolean;
  active: boolean;
  image?: string;
}

interface PatientPortalContent {
  id: string;
  welcomeMessage: string;
  clinicInfo: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  healthTips: Array<{
    id: string;
    title: string;
    content: string;
    icon: string;
  }>;
  updatedAt: string;
  updatedBy: string;
}

export default function PatientHomeAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [portalContent, setPortalContent] = React.useState<PatientPortalContent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingPromotion, setEditingPromotion] = React.useState<Promotion | null>(null);
  const [showPromotionForm, setShowPromotionForm] = React.useState(false);

  // Check permissions
  const canEdit = AuthService.hasPermission(user, 'edit_patient_portal');
  const canView = AuthService.hasPermission(user, 'view_patient_portal');

  React.useEffect(() => {
    if (!canView) return;
    fetchData();
  }, [canView]);

  const fetchData = async () => {
    try {
      // Fetch promotions
      const promotionsData = await listDocuments<Promotion>('patient-promotions');
      setPromotions(promotionsData || []);

      // Fetch portal content
      const contentData = await listDocuments<PatientPortalContent>('patient-portal-content');
      if (contentData && contentData.length > 0) {
        setPortalContent(contentData[0]);
      } else {
        // Set default content
        setPortalContent({
          id: 'default',
          welcomeMessage: 'Welcome to CairoDental Patient Portal',
          clinicInfo: {
            name: 'CairoDental',
            description: 'Your trusted dental care provider',
            phone: '+1 (555) 123-4567',
            email: 'info@cairodental.com',
            address: '123 Dental Street, Cairo, Egypt'
          "use client";

          import * as React from 'react';
          import { useRouter } from 'next/navigation';

          export default function PatientHomeAdminPage() {
            const router = useRouter();
            React.useEffect(() => {
              router.replace('/patient-portal?tab=content-admin');
            }, [router]);
            return null;
          }
              icon: 'Heart'
*/
