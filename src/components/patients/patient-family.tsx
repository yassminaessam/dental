'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Phone,
  Trash2,
  Star,
  Link,
  Search,
  Loader2,
  Mail,
  User,
} from 'lucide-react';
import type { Patient, PatientFamilyMember } from '@/lib/types';

interface PatientFamilyProps {
  patientId: string;
  patientName?: string;
  familyMembers?: PatientFamilyMember[];
  onFamilyUpdated?: () => void;
  compact?: boolean;
}

const familyRelationships = [
  { value: 'spouse', labelKey: 'patients.family.spouse' },
  { value: 'parent', labelKey: 'patients.family.parent' },
  { value: 'child', labelKey: 'patients.family.child' },
  { value: 'sibling', labelKey: 'patients.family.sibling' },
  { value: 'guardian', labelKey: 'patients.family.guardian' },
  { value: 'dependent', labelKey: 'patients.family.dependent' },
  { value: 'grandparent', labelKey: 'patients.family.grandparent' },
  { value: 'grandchild', labelKey: 'patients.family.grandchild' },
  { value: 'other', labelKey: 'patients.family.other' },
];

export function PatientFamily({ 
  patientId, 
  patientName,
  familyMembers: initialMembers = [], 
  onFamilyUpdated,
  compact = false 
}: PatientFamilyProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [familyMembers, setFamilyMembers] = React.useState<PatientFamilyMember[]>(initialMembers);
  const [loading, setLoading] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'new' | 'existing'>('new');
  
  // For searching existing patients
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Patient[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  
  // For creating new family member
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberLastName, setNewMemberLastName] = React.useState('');
  const [newMemberPhone, setNewMemberPhone] = React.useState('');
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberGender, setNewMemberGender] = React.useState<'male' | 'female'>('male');
  
  // Common fields
  const [relationship, setRelationship] = React.useState('');
  const [isPrimaryContact, setIsPrimaryContact] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  // Fetch family members on mount
  React.useEffect(() => {
    fetchFamilyMembers();
  }, [patientId]);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/family`);
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.familyMembers || []);
      }
    } catch (error) {
      console.error('Failed to fetch family members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search for patients
  const searchPatients = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.patients.filter((p: Patient) => 
          p.id !== patientId && // Exclude current patient
          !familyMembers.some(fm => fm.relativeId === p.id) && // Exclude existing family
          (
            `${p.name} ${p.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
            p.phone?.includes(term) ||
            p.email?.toLowerCase().includes(term.toLowerCase())
          )
        );
        setSearchResults(filtered.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'existing') {
        searchPatients(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const resetForm = () => {
    setAddDialogOpen(false);
    setSelectedPatient(null);
    setRelationship('');
    setIsPrimaryContact(false);
    setNotes('');
    setSearchTerm('');
    setSearchResults([]);
    setNewMemberName('');
    setNewMemberLastName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberGender('male');
    setActiveTab('new');
  };

  // Add new family member (creates patient first, then links)
  const handleAddNewFamilyMember = async () => {
    if (!newMemberName || !relationship) {
      toast({
        title: t('common.error'),
        description: t('patients.family.enter_name_and_relationship'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Step 1: Create the new patient
      const createResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          lastName: newMemberLastName || '',
          phone: newMemberPhone || '',
          email: newMemberEmail || '',
          gender: newMemberGender,
          status: 'Active',
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create patient');
      }

      const newPatient = await createResponse.json();
      
      // Step 2: Link as family member
      const linkResponse = await fetch(`/api/patients/${patientId}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativeId: newPatient.id,
          relationship,
          isPrimaryContact,
          notes: notes || undefined,
        }),
      });

      if (!linkResponse.ok) {
        const error = await linkResponse.json();
        throw new Error(error.error || 'Failed to link family member');
      }

      const data = await linkResponse.json();
      setFamilyMembers(prev => [...prev, data.familyMember]);
      
      toast({
        title: t('patients.family.member_added'),
        description: t('patients.family.member_added_desc', { 
          name: `${newMemberName} ${newMemberLastName}`.trim() 
        }),
      });

      resetForm();
      onFamilyUpdated?.();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Link existing patient as family member
  const handleLinkExistingPatient = async () => {
    if (!selectedPatient || !relationship) {
      toast({
        title: t('common.error'),
        description: t('patients.family.select_patient_and_relationship'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/patients/${patientId}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativeId: selectedPatient.id,
          relationship,
          isPrimaryContact,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add family member');
      }

      const data = await response.json();
      setFamilyMembers(prev => [...prev, data.familyMember]);
      
      toast({
        title: t('patients.family.member_added'),
        description: t('patients.family.member_added_desc', { 
          name: `${selectedPatient.name} ${selectedPatient.lastName}` 
        }),
      });

      resetForm();
      onFamilyUpdated?.();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (activeTab === 'new') {
      await handleAddNewFamilyMember();
    } else {
      await handleLinkExistingPatient();
    }
  };

  const handleRemoveFamilyMember = async (familyId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/family?familyId=${familyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove family member');
      }

      setFamilyMembers(prev => prev.filter(fm => fm.id !== familyId));
      
      toast({
        title: t('patients.family.member_removed'),
        description: t('patients.family.member_removed_desc'),
      });

      onFamilyUpdated?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('patients.family.error_removing'),
        variant: 'destructive',
      });
    }
  };

  const getRelationshipLabel = (value: string) => {
    const rel = familyRelationships.find(r => r.value === value);
    return rel ? t(rel.labelKey) : value;
  };

  // Shared dialog component
  const renderAddFamilyDialog = () => (
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('patients.family.add_member')}</DialogTitle>
          <DialogDescription>
            {patientName && (
              <span className="block font-medium text-foreground mb-1">
                {t('patients.family.adding_for')}: {patientName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'existing')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">{t('patients.family.create_new')}</TabsTrigger>
            <TabsTrigger value="existing">{t('patients.family.link_existing')}</TabsTrigger>
          </TabsList>
          
          {/* Create New Family Member Tab */}
          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('patients.first_name')} *</Label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    placeholder={t('patients.first_name')}
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('patients.last_name')}</Label>
                <Input
                  placeholder={t('patients.last_name')}
                  value={newMemberLastName}
                  onChange={(e) => setNewMemberLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('patients.phone')}</Label>
                <div className="relative">
                  <Phone className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    placeholder={t('patients.phone')}
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('patients.email')}</Label>
                <div className="relative">
                  <Mail className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    type="email"
                    placeholder={t('patients.email')}
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('patients.gender')}</Label>
              <Select value={newMemberGender} onValueChange={(v) => setNewMemberGender(v as 'male' | 'female')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('patients.male')}</SelectItem>
                  <SelectItem value="female">{t('patients.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Link Existing Patient Tab */}
          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t('patients.family.search_patient')}</Label>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={t('patients.family.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>
              
              {/* Search Results */}
              {searching && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-auto">
                  {searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 hover:bg-muted transition-colors",
                        selectedPatient?.id === patient.id && "bg-primary/10"
                      )}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchTerm(`${patient.name} ${patient.lastName}`);
                        setSearchResults([]);
                      }}
                    >
                      <div className="font-medium">{patient.name} {patient.lastName}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {patient.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {selectedPatient && (
                <div className="p-3 rounded bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium">
                        {selectedPatient.name} {selectedPatient.lastName}
                      </span>
                      {selectedPatient.phone && (
                        <span className="text-sm text-muted-foreground ml-2" dir="ltr">
                          ({selectedPatient.phone})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Common Fields */}
        <div className="space-y-4 border-t pt-4 mt-4">
          <div className="space-y-2">
            <Label>{t('patients.family.relationship')} *</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder={t('patients.family.select_relationship')} />
              </SelectTrigger>
              <SelectContent>
                {familyRelationships.map((rel) => (
                  <SelectItem key={rel.value} value={rel.value}>
                    {t(rel.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id="isPrimaryContact"
              checked={isPrimaryContact}
              onCheckedChange={(checked) => setIsPrimaryContact(checked === true)}
            />
            <Label htmlFor="isPrimaryContact" className="text-sm cursor-pointer">
              {t('patients.family.primary_contact')}
            </Label>
          </div>

          <div className="space-y-2">
            <Label>{t('common.notes')} ({t('common.optional')})</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('patients.family.notes_placeholder')}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAddFamilyMember} 
            disabled={processing || (activeTab === 'new' ? !newMemberName || !relationship : !selectedPatient || !relationship)}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('common.processing')}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('patients.family.add_member')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Compact view
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {t('patients.family.title')}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="h-7 px-2"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : familyMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('patients.family.no_members')}</p>
        ) : (
          <div className="space-y-1">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {member.isPrimaryContact && (
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  )}
                  <span className="font-medium">{member.relativeName}</span>
                  <Badge variant="outline" className="text-xs">
                    {getRelationshipLabel(member.relationship)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {member.relativePhone && (
                    <span className="text-xs text-muted-foreground" dir="ltr">
                      {member.relativePhone}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveFamilyMember(member.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderAddFamilyDialog()}
      </div>
    );
  }

  // Full display mode
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('patients.family.title')}
            </CardTitle>
            <CardDescription>{t('patients.family.description')}</CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('patients.family.add_member')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('patients.family.no_members')}</p>
            <p className="text-sm">{t('patients.family.no_members_desc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {member.isPrimaryContact && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                      <span className="font-semibold">{member.relativeName}</span>
                      <Badge variant="secondary">
                        {getRelationshipLabel(member.relationship)}
                      </Badge>
                    </div>
                    {member.relativePhone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{member.relativePhone}</span>
                      </div>
                    )}
                    {member.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{member.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFamilyMember(member.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {renderAddFamilyDialog()}
      </CardContent>
    </Card>
  );
}
