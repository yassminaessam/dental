'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listCollection } from '@/services/datastore';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
import type { Appointment, StaffMember } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingFormData {
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  urgency: 'Low' | 'Medium' | 'High';
  phone: string;
  notes: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available: boolean;
}

const appointmentTypes = [
  'Regular Checkup',
  'Cleaning',
  'Filling',
  'Root Canal',
  'Extraction',
  'Orthodontic Consultation',
  'Cosmetic Consultation',
  'Emergency Visit',
  'Follow-up',
  'Other'
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

export default function PatientAppointmentBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    reason: '',
    urgency: 'Medium',
    phone: user?.phone || '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctorsAndAppointments();
    }
  }, [isOpen]);

  const fetchDoctorsAndAppointments = async () => {
    try {
      const appointments = await AppointmentsService.list();
      setExistingAppointments(appointments || []);

      const staff = await listCollection<StaffMember>('staff');
      const dentistStaff = staff.filter((member) => member.role === 'Dentist');
      setDoctors(
        dentistStaff.map((member) => ({
          id: member.id,
          name: member.name,
          specialization: member.notes || 'General Dentistry',
          available: member.status === 'Active',
        }))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const isTimeSlotAvailable = (date: string, time: string): boolean => {
    const requestedDateTime = new Date(`${date}T${time}`);
    
    // Check if slot is already booked
    const isBooked = existingAppointments.some(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate.getTime() === requestedDateTime.getTime() && 
             apt.status !== 'Cancelled';
    });

    // Check if it's in the past
    const isPast = requestedDateTime < new Date();

    // Check if it's within business hours (9 AM - 6 PM, Monday - Friday)
    const dayOfWeek = requestedDateTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return !isBooked && !isPast && !isWeekend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate form
      if (!formData.appointmentType || !formData.preferredDate || !formData.preferredTime) {
        throw new Error('Please fill in all required fields');
      }

      // Check if selected time is still available
      if (!isTimeSlotAvailable(formData.preferredDate, formData.preferredTime)) {
        throw new Error('Selected time slot is no longer available');
      }

      const appointmentDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);

      const newAppointment: AppointmentCreateInput = {
        patient: `${user.firstName} ${user.lastName}`,
        patientId: user.id,
        patientEmail: user.email,
        patientPhone: formData.phone,
        type: formData.appointmentType,
        dateTime: appointmentDateTime,
        doctor: 'To be assigned',
        status: 'Pending',
        duration: '60',
        reason: formData.reason,
        urgency: formData.urgency,
        notes: formData.notes,
        bookedBy: 'patient',
      };

      const createdAppointment = await AppointmentsService.create(newAppointment);
      setExistingAppointments((prev) => [...prev, createdAppointment]);

      toast({
        title: t('appointments.toast.request_submitted') || t('analytics.toast.exporting_report'),
        description: t('appointments.toast.request_submitted_desc') || t('appointments.schedule_description')
      });

      // Reset form and close dialog
      setFormData({
        appointmentType: '',
        preferredDate: '',
        preferredTime: '',
        reason: '',
        urgency: 'Medium',
        phone: user?.phone || '',
        notes: ''
      });
      setIsOpen(false);

    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('appointments.toast.error_scheduling'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!formData.preferredDate) return [];
    
    return timeSlots.filter(time => 
      isTimeSlotAvailable(formData.preferredDate, time)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Calendar className="h-5 w-5 mr-2" />
          {t('appointments.schedule_appointment')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('appointments.schedule_appointment')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('patient_portal.section.portal_users')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('patients.name')}</Label>
                  <Input 
                    value={`${user?.firstName} ${user?.lastName}`} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>{t('patient_portal.table.email')}</Label>
                  <Input 
                    value={user?.email} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{t('common.phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('common.phone')}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('appointments.appointment_details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appointmentType">{t('appointments.treatment_type')} *</Label>
                <Select 
                  value={formData.appointmentType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('appointments.select_treatment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
          <Label htmlFor="preferredDate">{t('appointments.pick_date')} *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value, preferredTime: '' }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
          <Label htmlFor="preferredTime">{t('appointments.time')} *</Label>
                  <Select 
                    value={formData.preferredTime} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
                    disabled={!formData.preferredDate}
                  >
                    <SelectTrigger>
            <SelectValue placeholder={t('appointments.select_time')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.preferredDate && getAvailableTimeSlots().length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
            {t('appointments.no_available_time_slots')}
                    </p>
                  )}
                </div>
              </div>

              <div>
    <Label htmlFor="urgency">{t('appointments.urgency')}</Label>
                <Select 
                  value={formData.urgency} 
                  onValueChange={(value: 'Low' | 'Medium' | 'High') => setFormData(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
      <Badge variant="secondary">{t('appointments.urgency.low')}</Badge>
      <span>{t('appointments.urgency.routine')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
      <Badge variant="default">{t('appointments.urgency.medium')}</Badge>
      <span>{t('appointments.urgency.standard')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
      <Badge variant="destructive">{t('appointments.urgency.high')}</Badge>
      <span>{t('appointments.urgency.urgent')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">{t('dashboard.appointment_reason')} *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={t('dashboard.rejection_reason_placeholder')}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">{t('appointments.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('appointments.notes_placeholder')}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Information Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Appointment Confirmation Process</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Your appointment request will be reviewed by our staff</li>
                  <li>• You'll receive confirmation within 24 hours</li>
                  <li>• A doctor will be assigned based on your needs</li>
                  <li>• You can reschedule or cancel if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.appointmentType || !formData.preferredDate || !formData.preferredTime}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('appointments.submit_request')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
