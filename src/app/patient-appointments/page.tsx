'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import PatientAppointmentBooking from '@/components/appointments/patient-appointment-booking';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientAppointmentsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [patientId, setPatientId] = React.useState<string | null>(null);

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
      setPatientId(data.patient.id);
      fetchAppointments(data.patient.id);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      setLoading(false);
    }
  };

  const fetchAppointments = async (patId: string) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/patient/appointments?email=${encodeURIComponent(user.email)}&patientId=${patId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: t('appointments.toast.error_fetching'),
        description: 'Failed to load your appointments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');

      toast({
        title: t('appointments.toast.status_updated'),
        description: 'Your appointment has been cancelled',
      });
      
      if (patientId) {
        fetchAppointments(patientId);
      }
    } catch (error) {
      toast({
        title: t('appointments.toast.error_status'),
        description: 'Failed to cancel appointment',
        variant: 'destructive'
      });
    }
  };

  const handleReschedule = (appointmentId: string) => {
    toast({
      title: 'Reschedule Request',
      description: 'Please contact the clinic to reschedule your appointment. This feature will be available soon.',
    });
  };
  const upcomingAppointments = appointments.filter(a => 
    ['Confirmed', 'Pending'].includes(a.status)
  );
  const pastAppointments = appointments.filter(a => 
    ['Completed', 'Cancelled'].includes(a.status)
  );

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.appointments.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.appointments.subtitle')}</p>
          </div>

          <div className="mb-6">
            <PatientAppointmentBooking />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('patient_pages.appointments.upcoming')}</h2>
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No upcoming appointments
                </CardContent>
              </Card>
            ) : upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{appointment.type}</CardTitle>
                      <CardDescription>{t('patient_pages.appointments.with_doctor')} {appointment.doctor}</CardDescription>
                    </div>
                    <Badge variant="default">{appointment.status === 'Confirmed' ? t('appointments.status.confirmed') : appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(appointment.dateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(appointment.dateTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      Main Office
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReschedule(appointment.id)}
                    >
                      {t('patient_pages.appointments.reschedule')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      {t('patient_pages.appointments.cancel')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <h2 className="text-xl font-semibold mt-8">{t('patient_pages.appointments.past')}</h2>
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No past appointments
                </CardContent>
              </Card>
            ) : pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{appointment.type}</CardTitle>
                      <CardDescription>{t('patient_pages.appointments.with_doctor')} {appointment.doctor}</CardDescription>
                    </div>
                    <Badge variant="secondary">{appointment.status === 'Completed' ? t('common.completed') : appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(appointment.dateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(appointment.dateTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
