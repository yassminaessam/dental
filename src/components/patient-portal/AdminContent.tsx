'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, Eye, Globe, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export default function AdminContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [content, setPortalContent] = React.useState<PatientPortalContent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingPromotion, setEditingPromotion] = React.useState<Promotion | null>(null);
  const [showPromotionForm, setShowPromotionForm] = React.useState(false);

  const canEdit = AuthService.hasPermission(user, 'edit_patient_portal');
  const canView = AuthService.hasPermission(user, 'view_patient_portal');

  React.useEffect(() => {
    if (!canView) return;
    (async () => {
      try {
        const promotionsData = await listDocuments<Promotion>('patient-promotions');
        setPromotions(promotionsData || []);

        const contentData = await listDocuments<PatientPortalContent>('patient-portal-content');
        if (contentData && contentData.length > 0) {
          setPortalContent(contentData[0]);
        } else {
          setPortalContent({
            id: 'default',
            welcomeMessage: 'Welcome to CairoDental Patient Portal',
            clinicInfo: {
              name: 'CairoDental',
              description: 'Your trusted dental care provider',
              phone: '+1 (555) 123-4567',
              email: 'info@cairodental.com',
              address: '123 Dental Street, Cairo, Egypt'
            },
            healthTips: [],
            updatedAt: new Date().toISOString(),
            updatedBy: user?.firstName + ' ' + user?.lastName || 'System'
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: t('common.error'),
          description: t('patient_portal_admin.toast.error_loading'),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [canView, t, toast, user]);

  const savePromotion = async (promotion: Omit<Promotion, 'id'> | Promotion) => {
    if (!canEdit) return;
    try {
      const id = 'id' in promotion ? promotion.id : `promo-${Date.now()}`;
      const promotionData = { ...promotion, id };
      await setDocument('patient-promotions', id, promotionData);
      setPromotions(prev => {
        const existing = prev.find(p => p.id === id);
        return existing ? prev.map(p => p.id === id ? promotionData as Promotion : p) : [...prev, promotionData as Promotion];
      });
      toast({ title: t('common.success'), description: t('patient_portal_admin.toast.promotion_saved_desc') });
      setEditingPromotion(null);
      setShowPromotionForm(false);
    } catch (error) {
      toast({ title: t('common.error'), description: t('patient_portal_admin.toast.error_saving_promotion'), variant: 'destructive' });
    }
  };

  const deletePromotion = async (id: string) => {
    if (!canEdit) return;
    try {
      await deleteDocument('patient-promotions', id);
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast({ title: t('common.success'), description: t('patient_portal_admin.toast.promotion_deleted_desc') });
    } catch (error) {
      toast({ title: t('common.error'), description: t('patient_portal_admin.toast.error_deleting_promotion'), variant: 'destructive' });
    }
  };

  const savePortalContent = async (c: PatientPortalContent) => {
    if (!canEdit) return;
    try {
      const updatedContent = {
        ...c,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.firstName + ' ' + user?.lastName || 'System'
      };
      await setDocument('patient-portal-content', c.id, updatedContent);
      setPortalContent(updatedContent);
      toast({ title: t('common.success'), description: t('patient_portal_admin.toast.content_saved_desc') });
    } catch (error) {
      toast({ title: t('common.error'), description: t('patient_portal_admin.toast.error_saving_content'), variant: 'destructive' });
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('patient_portal_admin.access_denied_title')}</h2>
          <p className="text-gray-600">{t('patient_portal_admin.access_denied_desc')}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-48">
        <div className="animate-pulse">{t('patient_portal_admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t('patient_portal_admin.promotions_and_offers')}
            </CardTitle>
            {canEdit && (
              <Button onClick={() => setShowPromotionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('patient_portal_admin.add_promotion')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('patient_portal_admin.no_promotions')}</p>
              {canEdit && (
                <Button onClick={() => setShowPromotionForm(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('patient_portal_admin.add_first_promotion')}
                </Button>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promotion) => (
              <Card key={promotion.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{promotion.title}</h3>
                      <Badge variant={promotion.featured ? 'default' : 'secondary'} className="mt-1">
                        {promotion.discount}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={promotion.active}
                        onCheckedChange={(checked) => {
                          if (canEdit) {
                            savePromotion({ ...promotion, active: checked });
                          }
                        }}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-2">{promotion.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{t('patient_portal_admin.valid_until_label')}: {new Date(promotion.validUntil).toLocaleDateString()}</div>
                    <div>{t('patient_portal_admin.code_label')}: <code className="bg-gray-100 px-1 rounded text-xs">{promotion.code}</code></div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingPromotion(promotion)}>
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit')}
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => deletePromotion(promotion.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {(showPromotionForm || editingPromotion) && canEdit && (
        <PromotionForm
          promotion={editingPromotion}
          onSave={savePromotion}
          onCancel={() => { setShowPromotionForm(false); setEditingPromotion(null); }}
          t={t}
        />
      )}

      {content && (
        <PortalContentForm content={content} onSave={savePortalContent} canEdit={canEdit} t={t} language={language} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('patient_portal_admin.portal_analytics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">245</div>
              <div className="text-sm text-gray-600">{t('patient_portal_admin.metrics.total_logins')}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">18</div>
              <div className="text-sm text-gray-600">{t('patient_portal_admin.metrics.promotion_clicks')}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">92%</div>
              <div className="text-sm text-gray-600">{t('patient_portal_admin.metrics.user_satisfaction')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromotionForm({ 
  promotion, 
  onSave, 
  onCancel,
  t
}: { 
  promotion: Promotion | null;
  onSave: (promotion: Omit<Promotion, 'id'> | Promotion) => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const [formData, setFormData] = React.useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    discount: promotion?.discount || '',
    validUntil: promotion?.validUntil || '',
    code: promotion?.code || '',
    featured: promotion?.featured || false,
    active: promotion?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promotion) {
      onSave({ ...promotion, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{promotion ? t('patient_portal_admin.edit_promotion') : t('patient_portal_admin.add_new_promotion')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">{t('patient_portal_admin.form.title')}</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="discount">{t('patient_portal_admin.form.discount')}</Label>
              <Input id="discount" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))} placeholder={t('patient_portal_admin.form.discount_placeholder')} required />
            </div>
            <div>
              <Label htmlFor="code">{t('patient_portal_admin.form.promo_code')}</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="validUntil">{t('patient_portal_admin.form.valid_until')}</Label>
              <Input id="validUntil" type="date" value={formData.validUntil} onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))} required />
            </div>
          </div>
          <div>
            <Label htmlFor="description">{t('patient_portal_admin.form.description')}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} required />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} />
              <Label htmlFor="featured">{t('patient_portal_admin.form.featured_promotion')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))} />
              <Label htmlFor="active">{t('common.active')}</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {t('patient_portal_admin.save_promotion')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PortalContentForm({ 
  content, 
  onSave, 
  canEdit,
  t,
  language
}: { 
  content: PatientPortalContent;
  onSave: (content: PatientPortalContent) => void;
  canEdit: boolean;
  t: (key: string) => string;
  language: string;
}) {
  const [formData, setFormData] = React.useState(content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('patient_portal_admin.portal_content_settings')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="welcomeMessage">{t('patient_portal_admin.welcome_message')}</Label>
            <Input id="welcomeMessage" value={formData.welcomeMessage} onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))} disabled={!canEdit} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('patient_portal_admin.clinic_information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinicName">{t('patient_portal_admin.clinic_name')}</Label>
                <Input id="clinicName" value={formData.clinicInfo.name} onChange={(e) => setFormData(prev => ({ ...prev, clinicInfo: { ...prev.clinicInfo, name: e.target.value } }))} disabled={!canEdit} />
              </div>
              <div>
                <Label htmlFor="clinicPhone">{t('patient_portal_admin.phone')}</Label>
                <Input id="clinicPhone" value={formData.clinicInfo.phone} onChange={(e) => setFormData(prev => ({ ...prev, clinicInfo: { ...prev.clinicInfo, phone: e.target.value } }))} disabled={!canEdit} />
              </div>
              <div>
                <Label htmlFor="clinicEmail">{t('patient_portal_admin.email')}</Label>
                <Input id="clinicEmail" type="email" value={formData.clinicInfo.email} onChange={(e) => setFormData(prev => ({ ...prev, clinicInfo: { ...prev.clinicInfo, email: e.target.value } }))} disabled={!canEdit} />
              </div>
              <div>
                <Label htmlFor="clinicAddress">{t('patient_portal_admin.address')}</Label>
                <Input id="clinicAddress" value={formData.clinicInfo.address} onChange={(e) => setFormData(prev => ({ ...prev, clinicInfo: { ...prev.clinicInfo, address: e.target.value } }))} disabled={!canEdit} />
              </div>
            </div>
            <div>
              <Label htmlFor="clinicDescription">{t('patient_portal_admin.description')}</Label>
              <Textarea id="clinicDescription" value={formData.clinicInfo.description} onChange={(e) => setFormData(prev => ({ ...prev, clinicInfo: { ...prev.clinicInfo, description: e.target.value } }))} disabled={!canEdit} />
            </div>
          </div>

          {canEdit && (
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {t('patient_portal_admin.save_content')}
            </Button>
          )}

          {content.updatedAt && (
            <div className="text-sm text-gray-500 mt-4">
              {t('patient_portal_admin.last_updated_prefix')}: {new Date(content.updatedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t('patient_portal_admin.by')} {content.updatedBy}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
