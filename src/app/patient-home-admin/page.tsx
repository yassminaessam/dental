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
          },
          healthTips: [
            {
              id: '1',
              title: 'Daily Oral Care',
              content: 'Brush twice daily with fluoride toothpaste and floss daily to maintain optimal oral health.',
              icon: 'Smile'
            },
            {
              id: '2',
              title: 'Nutrition for Teeth',
              content: 'Limit sugary snacks and drinks. Choose water over sodas and energy drinks.',
              icon: 'Heart'
            },
            {
              id: '3',
              title: 'Regular Checkups',
              content: 'Visit your dentist every 6 months for cleanings and preventive care.',
              icon: 'CheckCircle'
            }
          ],
          updatedAt: new Date().toISOString(),
          updatedBy: user?.firstName + ' ' + user?.lastName || 'System'
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient portal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePromotion = async (promotion: Omit<Promotion, 'id'> | Promotion) => {
    if (!canEdit) return;

    try {
      const id = 'id' in promotion ? promotion.id : `promo-${Date.now()}`;
      const promotionData = {
        ...promotion,
        id,
      };

      await setDocument('patient-promotions', id, promotionData);
      
      setPromotions(prev => {
        const existing = prev.find(p => p.id === id);
        if (existing) {
          return prev.map(p => p.id === id ? promotionData as Promotion : p);
        } else {
          return [...prev, promotionData as Promotion];
        }
      });

      toast({
        title: "Success",
        description: "Promotion saved successfully"
      });

      setEditingPromotion(null);
      setShowPromotionForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save promotion",
        variant: "destructive"
      });
    }
  };

  const deletePromotion = async (id: string) => {
    if (!canEdit) return;

    try {
      await deleteDocument('patient-promotions', id);
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Promotion deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive"
      });
    }
  };

  const savePortalContent = async (content: PatientPortalContent) => {
    if (!canEdit) return;

    try {
      const updatedContent = {
        ...content,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.firstName + ' ' + user?.lastName || 'System'
      };

      await setDocument('patient-portal-content', content.id, updatedContent);
      setPortalContent(updatedContent);

      toast({
        title: "Success",
        description: "Portal content saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save portal content",
        variant: "destructive"
      });
    }
  };

  if (!canView) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view the patient portal management.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-pulse">Loading patient portal management...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Portal Management</h1>
            <p className="text-gray-600">Manage the content and promotions shown to patients</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/patient-home" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Preview Portal
              </a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="promotions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="content">Portal Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Promotions & Offers
                  </CardTitle>
                  {canEdit && (
                    <Button onClick={() => setShowPromotionForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Promotion
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promotions.map((promotion) => (
                    <Card key={promotion.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{promotion.title}</h3>
                            <Badge variant={promotion.featured ? "default" : "secondary"} className="mt-1">
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
                          <div>Valid until: {new Date(promotion.validUntil).toLocaleDateString()}</div>
                          <div>Code: <code className="bg-gray-100 px-1 rounded text-xs">{promotion.code}</code></div>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPromotion(promotion)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePromotion(promotion.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Promotion Form */}
            {(showPromotionForm || editingPromotion) && canEdit && (
              <PromotionForm
                promotion={editingPromotion}
                onSave={savePromotion}
                onCancel={() => {
                  setShowPromotionForm(false);
                  setEditingPromotion(null);
                }}
              />
            )}
          </TabsContent>

          {/* Portal Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {portalContent && (
              <PortalContentForm
                content={portalContent}
                onSave={savePortalContent}
                canEdit={canEdit}
              />
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portal Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">245</div>
                    <div className="text-sm text-gray-600">Total Patient Logins</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">18</div>
                    <div className="text-sm text-gray-600">Promotion Clicks</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">92%</div>
                    <div className="text-sm text-gray-600">User Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Promotion Form Component
function PromotionForm({ 
  promotion, 
  onSave, 
  onCancel 
}: { 
  promotion: Promotion | null;
  onSave: (promotion: Omit<Promotion, 'id'> | Promotion) => void;
  onCancel: () => void;
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
        <CardTitle>{promotion ? 'Edit Promotion' : 'Add New Promotion'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                placeholder="e.g. 20% OFF, $100 OFF, FREE"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured Promotion</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Promotion
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Portal Content Form Component
function PortalContentForm({ 
  content, 
  onSave, 
  canEdit 
}: { 
  content: PatientPortalContent;
  onSave: (content: PatientPortalContent) => void;
  canEdit: boolean;
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
          Portal Content Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input
              id="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clinic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input
                  id="clinicName"
                  value={formData.clinicInfo.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    clinicInfo: { ...prev.clinicInfo, name: e.target.value }
                  }))}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="clinicPhone">Phone</Label>
                <Input
                  id="clinicPhone"
                  value={formData.clinicInfo.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    clinicInfo: { ...prev.clinicInfo, phone: e.target.value }
                  }))}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="clinicEmail">Email</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  value={formData.clinicInfo.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    clinicInfo: { ...prev.clinicInfo, email: e.target.value }
                  }))}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="clinicAddress">Address</Label>
                <Input
                  id="clinicAddress"
                  value={formData.clinicInfo.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    clinicInfo: { ...prev.clinicInfo, address: e.target.value }
                  }))}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clinicDescription">Description</Label>
              <Textarea
                id="clinicDescription"
                value={formData.clinicInfo.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  clinicInfo: { ...prev.clinicInfo, description: e.target.value }
                }))}
                disabled={!canEdit}
              />
            </div>
          </div>

          {canEdit && (
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </Button>
          )}

          {content.updatedAt && (
            <div className="text-sm text-gray-500 mt-4">
              Last updated: {new Date(content.updatedAt).toLocaleString()} by {content.updatedBy}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
