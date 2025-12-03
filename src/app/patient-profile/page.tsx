'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { listDocuments } from '@/lib/data-client';

type InsuranceProvider = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export default function PatientProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [patientId, setPatientId] = React.useState<string | null>(null);

  // Personal Info State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [address, setAddress] = React.useState('');

  // Emergency Contact State
  const [emergencyName, setEmergencyName] = React.useState('');
  const [emergencyRelation, setEmergencyRelation] = React.useState('');
  const [emergencyPhone, setEmergencyPhone] = React.useState('');
  const [emergencyEmail, setEmergencyEmail] = React.useState('');

  // Insurance State
  const [insuranceProvider, setInsuranceProvider] = React.useState('');
  const [policyNumber, setPolicyNumber] = React.useState('');
  const [groupNumber, setGroupNumber] = React.useState('');
  const [policyHolder, setPolicyHolder] = React.useState('');
  const [insuranceProviders, setInsuranceProviders] = React.useState<InsuranceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

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

  React.useEffect(() => {
    if (user?.email) {
      fetchPatientProfile();
    }
  }, [user]);

  const fetchPatientProfile = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/patient/profile?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        console.error('Patient profile not found');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const patient = data.patient;
      
      setPatientId(patient.id);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(patient.phone || '');
      setDateOfBirth(patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '');
      setAddress(patient.address || '');
      setEmergencyName(patient.ecName || '');
      setEmergencyRelation(patient.ecRelationship || '');
      setEmergencyPhone(patient.ecPhone || '');
      setInsuranceProvider(patient.insuranceProvider || '');
      setPolicyNumber(patient.policyNumber || '');
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!patientId) {
      toast({
        title: 'Error',
        description: 'Patient profile not found',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          name: firstName,
          lastName,
          phone,
          dob: dateOfBirth ? new Date(dateOfBirth) : undefined,
          address,
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      toast({
        title: t('patient_pages.profile.profile_updated'),
        description: t('patient_pages.profile.profile_updated_desc')
      });
      
      fetchPatientProfile();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmergencyContact = async () => {
    if (!patientId) {
      toast({
        title: 'Error',
        description: 'Patient profile not found',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          ecName: emergencyName,
          ecRelationship: emergencyRelation,
          ecPhone: emergencyPhone,
        })
      });

      if (!response.ok) throw new Error('Failed to update emergency contact');
      
      toast({
        title: t('patient_pages.profile.emergency_updated'),
        description: 'Emergency contact information updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update emergency contact',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInsurance = async () => {
    if (!patientId) {
      toast({
        title: 'Error',
        description: 'Patient profile not found',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          insuranceProvider,
          policyNumber,
        })
      });

      if (!response.ok) throw new Error('Failed to update insurance');
      
      toast({
        title: t('patient_pages.profile.insurance_updated'),
        description: 'Insurance information updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update insurance',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('patient_pages.profile.password_changed'),
        description: 'Your password has been changed successfully'
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PatientOnly>
        <PatientLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-pulse text-lg">{t('common.loading')}</div>
            </div>
          </div>
        </PatientLayout>
      </PatientOnly>
    );
  }

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.profile.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.profile.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{t('patient_pages.profile.picture')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold mb-4">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <Button variant="outline" size="sm">{t('patient_pages.profile.change_photo')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    {t('patient_pages.profile.notifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">{t('patient_pages.profile.email_notifications')}</Label>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">{t('patient_pages.profile.sms_notifications')}</Label>
                    <Switch id="sms-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appointment-reminders">{t('patient_pages.profile.appointment_reminders')}</Label>
                    <Switch id="appointment-reminders" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t('patient_pages.profile.personal_info')}
                  </CardTitle>
                  <CardDescription>{t('patient_pages.profile.update_details')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('patient_pages.profile.first_name')}</Label>
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('patient_pages.profile.last_name')}</Label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('patient_pages.profile.email')}</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('patient_pages.profile.phone')}</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">{t('patient_pages.profile.dob')}</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">{t('patient_pages.profile.gender')}</Label>
                      <select 
                        id="gender"
                        aria-label={t('patient_pages.profile.gender')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">{t('patient_pages.profile.select')}</option>
                        <option value="male">{t('patient_pages.profile.male')}</option>
                        <option value="female">{t('patient_pages.profile.female')}</option>
                        <option value="other">{t('patient_pages.profile.other')}</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">{t('patient_pages.profile.address')}</Label>
                      <Textarea 
                        id="address" 
                        placeholder={t('patient_pages.profile.address_placeholder')} 
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={handleSavePersonalInfo}
                    disabled={saving}
                  >
                    {saving ? t('common.uploading') : t('patient_pages.profile.save_changes')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t('patient_pages.profile.emergency_contact')}
                  </CardTitle>
                  <CardDescription>{t('patient_pages.profile.emergency_info')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">{t('patient_pages.profile.contact_name')}</Label>
                      <Input 
                        id="emergencyName" 
                        placeholder={t('patient_pages.profile.contact_name_placeholder')}
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelation">{t('patient_pages.profile.relationship')}</Label>
                      <Input 
                        id="emergencyRelation" 
                        placeholder={t('patient_pages.profile.relationship_placeholder')}
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">{t('patient_pages.profile.emergency_phone')}</Label>
                      <Input 
                        id="emergencyPhone" 
                        type="tel" 
                        placeholder="+1 (555) 123-4567"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyEmail">{t('patient_pages.profile.emergency_email')}</Label>
                      <Input 
                        id="emergencyEmail" 
                        type="email" 
                        placeholder="email@example.com"
                        value={emergencyEmail}
                        onChange={(e) => setEmergencyEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={handleSaveEmergencyContact}
                    disabled={saving}
                  >
                    {saving ? t('common.uploading') : t('patient_pages.profile.save_emergency')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('patient_pages.profile.insurance_info')}
                  </CardTitle>
                  <CardDescription>{t('patient_pages.profile.insurance_details')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insuranceProvider">{t('patient_pages.profile.insurance_provider')}</Label>
                      <Select onValueChange={setInsuranceProvider} value={insuranceProvider || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingProviders ? t('common.loading') : t('patient_pages.profile.provider_placeholder')} />
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
                    <div>
                      <Label htmlFor="policyNumber">{t('patient_pages.profile.policy_number')}</Label>
                      <Input 
                        id="policyNumber" 
                        placeholder={t('patient_pages.profile.policy_placeholder')}
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupNumber">{t('patient_pages.profile.group_number')}</Label>
                      <Input 
                        id="groupNumber" 
                        placeholder={t('patient_pages.profile.group_placeholder')}
                        value={groupNumber}
                        onChange={(e) => setGroupNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="policyHolder">{t('patient_pages.profile.policy_holder')}</Label>
                      <Input 
                        id="policyHolder" 
                        placeholder={t('patient_pages.profile.holder_placeholder')}
                        value={policyHolder}
                        onChange={(e) => setPolicyHolder(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={handleSaveInsurance}
                    disabled={saving}
                  >
                    {saving ? t('common.uploading') : t('patient_pages.profile.update_insurance')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('patient_pages.profile.security')}
                  </CardTitle>
                  <CardDescription>{t('patient_pages.profile.change_password')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">{t('patient_pages.profile.current_password')}</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">{t('patient_pages.profile.new_password')}</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{t('patient_pages.profile.confirm_password')}</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={handleChangePassword}
                    disabled={saving}
                  >
                    {saving ? t('common.uploading') : t('patient_pages.profile.save_changes')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
