'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, User, Phone, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

const doctors = [
  { id: '1', name: 'Dr. Smith', specialization: 'General Dentistry' },
  { id: '2', name: 'Dr. Johnson', specialization: 'Orthodontics' },
  { id: '3', name: 'Dr. Williams', specialization: 'Oral Surgery' },
  { id: '4', name: 'Dr. Brown', specialization: 'Pediatric Dentistry' },
  { id: '5', name: 'Dr. Davis', specialization: 'Periodontics' }
];

interface PendingAppointmentsManagerProps {
  refreshTrigger?: number;
  onAppointmentUpdate?: () => void;
}

export default function PendingAppointmentsManager({ 
  refreshTrigger, 
  onAppointmentUpdate 
}: PendingAppointmentsManagerProps) {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user can manage appointments
  const canManageAppointments = AuthService.hasPermission(user, 'edit_appointments');

  useEffect(() => {
    if (canManageAppointments) {
      fetchPendingAppointments();
    }
  }, [canManageAppointments, refreshTrigger]);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to load appointments');
      }
      const data = await response.json();
      const appointments = (data.appointments ?? []) as Array<Record<string, unknown>>;
      const normalized: Appointment[] = appointments.map((entry) => ({
        ...entry,
        dateTime: new Date(entry.dateTime as string),
        createdAt: entry.createdAt ? new Date(entry.createdAt as string) : undefined,
        updatedAt: entry.updatedAt ? new Date(entry.updatedAt as string) : undefined,
        confirmedAt: entry.confirmedAt ? new Date(entry.confirmedAt as string) : undefined,
        rejectedAt: entry.rejectedAt ? new Date(entry.rejectedAt as string) : undefined,
      })) as Appointment[];

      const pending = normalized.filter(apt => 
        apt.status === 'Pending'
      ).sort((a, b) => {
        const urgencyOrder = { High: 3, Medium: 2, Low: 1 } as const;
        const urgencyA = urgencyOrder[(a as any).urgency as keyof typeof urgencyOrder] || 2;
        const urgencyB = urgencyOrder[(b as any).urgency as keyof typeof urgencyOrder] || 2;

        if (urgencyA !== urgencyB) {
          return urgencyB - urgencyA;
        }

        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      });
      
      setPendingAppointments(pending);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      toast({
  title: t('common.error'),
  description: t('dashboard.pending.failed_to_load'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string, assignedDoctor: string) => {
    setActionLoading(appointmentId);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Confirmed',
          doctor: assignedDoctor,
          confirmedAt: new Date().toISOString(),
          confirmedBy: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error ?? 'Failed to confirm appointment');
      }

      toast({
  title: t('dashboard.appointment_confirmed'),
  description: t('dashboard.appointment_confirmed_desc')
      });

      fetchPendingAppointments();
      onAppointmentUpdate?.();
    } catch (error) {
      toast({
  title: t('common.error'),
  description: t('dashboard.failed_confirm_appointment'),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointment = async (appointmentId: string, reason: string) => {
    setActionLoading(appointmentId);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
          cancelledBy: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error ?? 'Failed to reject appointment');
      }

      toast({
  title: t('dashboard.appointment_rejected'),
  description: t('dashboard.appointment_rejected_desc')
      });

      fetchPendingAppointments();
      onAppointmentUpdate?.();
    } catch (error) {
      toast({
  title: t('common.error'),
  description: t('dashboard.failed_reject_appointment'),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateTime: string | Date) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getUrgencyColor = (urgency: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (urgency) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  if (!canManageAppointments) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('dashboard.pending_appointments_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">{t('dashboard.loading_pending_appointments')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('dashboard.pending_appointments_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>{t('dashboard.no_pending_appointments')}</p>
            <p className="text-sm">{t('dashboard.all_requests_processed')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('dashboard.pending_appointments_title')}
          </div>
          <Badge variant="destructive">
            {pendingAppointments.length} {t('dashboard.pending_count')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.dateTime);
            
            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                date={date}
                time={time}
                isLoading={actionLoading === appointment.id}
                onConfirm={handleConfirmAppointment}
                onReject={handleRejectAppointment}
                getUrgencyColor={getUrgencyColor}
                t={t}
                isRTL={isRTL}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Separate component for individual appointment cards
function AppointmentCard({
  appointment,
  date,
  time,
  isLoading,
  onConfirm,
  onReject,
  getUrgencyColor,
  t,
  isRTL
}: {
  appointment: Appointment;
  date: string;
  time: string;
  isLoading: boolean;
  onConfirm: (id: string, doctor: string) => void;
  onReject: (id: string, reason: string) => void;
  getUrgencyColor: (urgency: string) => "default" | "destructive" | "outline" | "secondary";
  t: (key: string) => string;
  isRTL: boolean;
}) {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-yellow-50 border-yellow-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{appointment.patient}</span>
            <Badge variant={getUrgencyColor((appointment as any).urgency || 'Medium')}>
              {(() => {
                const u = (appointment as any).urgency || 'Medium';
                const level = t(
                  u === 'High' ? 'dashboard.urgency.high' : u === 'Low' ? 'dashboard.urgency.low' : 'dashboard.urgency.medium'
                );
                const priority = t('dashboard.priority');
                return isRTL ? `${priority}: ${level}` : `${level} ${priority}`;
              })()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {time}
            </div>
            {appointment.patientPhone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {appointment.patientPhone}
              </div>
            )}
          </div>
        </div>
        
        {(appointment as any).urgency === 'High' && (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium">{t('appointments.type')}:</span> {appointment.type}
        </div>
        <div>
          <span className="font-medium">{t('appointments.duration')}:</span> {appointment.duration || 60} {t('dashboard.minutes')}
        </div>
      </div>

      {(appointment as any).reason && (
        <div>
          <span className="font-medium text-sm">{t('dashboard.appointment_reason')}:</span>
          <p className="text-sm text-muted-foreground mt-1">{(appointment as any).reason}</p>
        </div>
      )}

      {appointment.notes && (
        <div>
          <span className="font-medium text-sm">{t('dashboard.appointment_notes')}:</span>
          <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
        <div className="flex-1">
          <Label htmlFor={`doctor-${appointment.id}`} className="text-sm font-medium">
            {t('dashboard.assign_doctor')}
          </Label>
          <Select
            value={selectedDoctor}
            onValueChange={setSelectedDoctor}
            disabled={isLoading}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t('dashboard.select_doctor')} />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.name}>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-xs text-muted-foreground">{doctor.specialization}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 sm:items-end">
          <Button
            onClick={() => onConfirm(appointment.id, selectedDoctor)}
            disabled={!selectedDoctor || isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {t('common.confirm')}
          </Button>

          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isLoading} className="flex-1 sm:flex-initial">
                <XCircle className="h-4 w-4 mr-2" />
                {t('dashboard.reject')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.reject_appointment_request')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectReason">{t('dashboard.reason_for_rejection')}</Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('dashboard.rejection_reason_placeholder')}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(false)}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      onReject(appointment.id, rejectReason);
                      setShowRejectDialog(false);
                      setRejectReason('');
                    }}
                    disabled={!rejectReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {t('dashboard.reject_appointment')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
