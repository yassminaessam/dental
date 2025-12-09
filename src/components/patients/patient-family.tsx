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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { listDocuments } from '@/lib/data-client';
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
  Calendar as CalendarIcon,
  MapPin,
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
} from 'lucide-react';
import type { Patient, PatientFamilyMember } from '@/lib/types';

type InsuranceProvider = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

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
  
  // For creating new family member - Personal Information
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberLastName, setNewMemberLastName] = React.useState('');
  const [newMemberPhone, setNewMemberPhone] = React.useState('');
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberDob, setNewMemberDob] = React.useState<Date | undefined>(undefined);
  const [newMemberGender, setNewMemberGender] = React.useState<'male' | 'female'>('male');
  const [newMemberAddress, setNewMemberAddress] = React.useState('');
  const [dobCalendarOpen, setDobCalendarOpen] = React.useState(false);
  
  // Insurance Information
  const [insuranceProvider, setInsuranceProvider] = React.useState('');
  const [policyNumber, setPolicyNumber] = React.useState('');
  const [insuranceProviders, setInsuranceProviders] = React.useState<InsuranceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(false);
  
  // Medical History
  const [medicalConditions, setMedicalConditions] = React.useState<string[]>([]);
  
  // User Account
  const [createUserAccount, setCreateUserAccount] = React.useState(false);
  const [userPassword, setUserPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Duplicate checking
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);
  
  // Common fields
  const [relationship, setRelationship] = React.useState('');
  const [isPrimaryContact, setIsPrimaryContact] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  // Fetch insurance providers on mount
  React.useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const providers = await listDocuments<InsuranceProvider>('insurance-providers');
        setInsuranceProviders(providers);
      } catch (error) {
        console.error('Failed to fetch insurance providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

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

  // Check for duplicate phone on blur
  const checkPhoneDuplicate = React.useCallback(async (phone: string) => {
    if (!phone || phone.length < 3) return;
    setIsCheckingPhone(true);
    setPhoneError(null);
    try {
      const response = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'phone') {
        setPhoneError(t('patients.phone_already_exists'));
      }
    } catch (error) {
      console.error('Error checking phone duplicate:', error);
    } finally {
      setIsCheckingPhone(false);
    }
  }, [t]);

  // Check for duplicate email on blur
  const checkEmailDuplicate = React.useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return;
    setIsCheckingEmail(true);
    setEmailError(null);
    try {
      const response = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'email') {
        setEmailError(t('patients.email_already_exists'));
      }
    } catch (error) {
      console.error('Error checking email duplicate:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [t]);

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
    // Personal Information
    setNewMemberName('');
    setNewMemberLastName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberDob(undefined);
    setNewMemberGender('male');
    setNewMemberAddress('');
    setDobCalendarOpen(false);
    // Insurance
    setInsuranceProvider('');
    setPolicyNumber('');
    // Medical History
    setMedicalConditions([]);
    // User Account
    setCreateUserAccount(false);
    setUserPassword('');
    setShowPassword(false);
    // Errors
    setPhoneError(null);
    setEmailError(null);
    setActiveTab('new');
  };

  // Add medical condition
  const addMedicalCondition = () => {
    setMedicalConditions(prev => [...prev, '']);
  };

  // Update medical condition at index
  const updateMedicalCondition = (index: number, value: string) => {
    setMedicalConditions(prev => prev.map((c, i) => i === index ? value : c));
  };

  // Remove medical condition
  const removeMedicalCondition = (index: number) => {
    setMedicalConditions(prev => prev.filter((_, i) => i !== index));
  };

  // Add new family member (creates patient first, then links)
  const handleAddNewFamilyMember = async () => {
    if (!newMemberName || !relationship || !newMemberDob || !newMemberPhone) {
      toast({
        title: t('common.error'),
        description: t('patients.family.enter_required_fields'),
        variant: 'destructive',
      });
      return;
    }

    // Email is required only when creating user account
    if (createUserAccount && !newMemberEmail) {
      toast({
        title: t('common.error'),
        description: t('patients.email_required_for_account'),
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate errors before submitting
    if (phoneError || emailError) {
      toast({
        title: t('common.error'),
        description: phoneError || emailError,
        variant: 'destructive',
      });
      return;
    }

    // Validate password if creating user account
    if (createUserAccount && (!userPassword || userPassword.length < 8)) {
      toast({
        title: t('common.error'),
        description: t('patients.password_requirements'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Step 1: Create the new patient with all fields
      const createResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          lastName: newMemberLastName || '',
          phone: newMemberPhone,
          email: newMemberEmail || `${newMemberPhone.replace(/[^0-9]/g, '')}@placeholder.local`,
          dob: newMemberDob?.toISOString(),
          gender: newMemberGender,
          status: 'Active',
          address: newMemberAddress || undefined,
          insuranceProvider: insuranceProvider || undefined,
          policyNumber: policyNumber || undefined,
          medicalHistory: medicalConditions.filter(c => c.trim()).length > 0 
            ? medicalConditions.filter(c => c.trim()).map(c => ({ condition: c.trim() })) 
            : undefined,
          createUserAccount: createUserAccount,
          userPassword: createUserAccount ? userPassword : undefined,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        // Handle 409 conflict (duplicate phone/email)
        if (createResponse.status === 409) {
          const field = error.field || '';
          if (field === 'phone') {
            setPhoneError(t('patients.phone_already_exists'));
            throw new Error(t('patients.phone_already_exists'));
          } else if (field === 'email') {
            setEmailError(t('patients.email_already_exists'));
            throw new Error(t('patients.email_already_exists'));
          }
          throw new Error(error.error || t('patients.error_duplicate_patient'));
        }
        throw new Error(error.error || 'Failed to create patient');
      }

      const result = await createResponse.json();
      const newPatient = result.patient || result;
      
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
      
      // Show success message with user account info if created
      let successDesc = t('patients.family.member_added_desc', { 
        name: `${newMemberName} ${newMemberLastName}`.trim() 
      });
      if (result.userCreated) {
        successDesc += ` ${t('patients.user_account_created')}`;
      }
      
      toast({
        title: t('patients.family.member_added'),
        description: successDesc,
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
      <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="sm:max-w-[700px] lg:max-w-[800px] max-h-[90vh]">
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
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2 thin-scrollbar">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'existing')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">{t('patients.family.create_new')}</TabsTrigger>
              <TabsTrigger value="existing">{t('patients.family.link_existing')}</TabsTrigger>
            </TabsList>
            
            {/* Create New Family Member Tab */}
            <TabsContent value="new" className="space-y-6 mt-4">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('patients.personal_information')}</h3>
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
                    <Label>{t('patients.last_name')} *</Label>
                    <Input
                      placeholder={t('patients.last_name')}
                      value={newMemberLastName}
                      onChange={(e) => setNewMemberLastName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="space-y-2">
                    <Label>{t('patients.phone')} *</Label>
                    <div className="relative">
                      <Phone className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                      <Input
                        placeholder={t('patients.phone')}
                        value={newMemberPhone}
                        onChange={(e) => {
                          setNewMemberPhone(e.target.value);
                          if (phoneError) setPhoneError(null);
                        }}
                        onBlur={(e) => checkPhoneDuplicate(e.target.value)}
                        className={cn(isRTL ? 'pr-10' : 'pl-10', phoneError && "border-red-500 focus-visible:ring-red-500")}
                        dir="ltr"
                      />
                    </div>
                    {isCheckingPhone && (
                      <p className="text-sm text-muted-foreground">{t('common.checking')}...</p>
                    )}
                    {phoneError && (
                      <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t('patients.date_of_birth')} *</Label>
                    <Popover open={dobCalendarOpen} onOpenChange={setDobCalendarOpen} modal={true}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            !newMemberDob && "text-muted-foreground"
                          )}
                        >
                          {newMemberDob ? (
                            <span>{format(newMemberDob, "PPP")}</span>
                          ) : (
                            <span>{t('patients.pick_date')}</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-2" align="start" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={newMemberDob}
                          onSelect={(date) => {
                            setNewMemberDob(date);
                            setDobCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          classNames={{
                            months: "flex flex-col space-y-2",
                            month: "space-y-2",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-xs font-medium",
                            caption_dropdowns: "flex gap-1",
                            dropdown: "text-xs",
                            dropdown_month: "text-xs",
                            dropdown_year: "text-xs",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
                            row: "flex w-full mt-0.5",
                            cell: "h-7 w-7 text-center text-xs p-0 relative",
                            day: "h-7 w-7 p-0 font-normal text-xs hover:bg-accent hover:text-accent-foreground rounded-md",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
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
                </div>

                <div className="mt-4">
                  <Label>{t('patients.address')}</Label>
                  <div className="relative mt-2">
                    <MapPin className={cn("absolute top-3 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                    <Textarea
                      placeholder={t('patients.address_placeholder')}
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      className={cn("min-h-[60px]", isRTL ? 'pr-10' : 'pl-10')}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('patients.insurance_information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('patients.insurance_provider')}</Label>
                    <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingProviders ? t('common.loading') : t('patients.insurance_provider_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('patients.no_insurance')}</SelectItem>
                        {insuranceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.name}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('patients.policy_number')}</Label>
                    <Input
                      placeholder={t('patients.policy_number_placeholder')}
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Medical History Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">{t('patients.medical_history')}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedicalCondition}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('patients.add_condition')}
                  </Button>
                </div>
                {medicalConditions.length > 0 && (
                  <div className="space-y-2">
                    {medicalConditions.map((condition, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={t('patients.medical_condition_placeholder')}
                          value={condition}
                          onChange={(e) => updateMedicalCondition(index, e.target.value)}
                          className="h-9"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMedicalCondition(index)}
                          className="h-9 w-9 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Account Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t('patients.user_account')}</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {t('patients.create_user_account')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('patients.create_user_account_description')}
                    </p>
                  </div>
                  <Checkbox
                    checked={createUserAccount}
                    onCheckedChange={(checked) => setCreateUserAccount(checked === true)}
                  />
                </div>
                
                {createUserAccount && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>{t('patients.email')} *</Label>
                      <div className="relative">
                        <Mail className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                        <Input
                          type="email"
                          placeholder={t('patients.email')}
                          value={newMemberEmail}
                          onChange={(e) => {
                            setNewMemberEmail(e.target.value);
                            if (emailError) setEmailError(null);
                          }}
                          onBlur={(e) => checkEmailDuplicate(e.target.value)}
                          className={cn(isRTL ? 'pr-10' : 'pl-10', emailError && "border-red-500 focus-visible:ring-red-500")}
                          dir="ltr"
                        />
                      </div>
                      {isCheckingEmail && (
                        <p className="text-sm text-muted-foreground">{t('common.checking')}...</p>
                      )}
                      {emailError && (
                        <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('patients.user_password')} *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t('patients.user_password_placeholder')}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('patients.password_requirements')}
                      </p>
                    </div>
                  </div>
                )}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAddFamilyMember} 
            disabled={
              processing || 
              phoneError !== null || 
              emailError !== null ||
              (activeTab === 'new' 
                ? !newMemberName || !newMemberLastName || !newMemberPhone || !newMemberDob || !relationship || (createUserAccount && (!newMemberEmail || !userPassword || userPassword.length < 8))
                : !selectedPatient || !relationship)
            }
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
