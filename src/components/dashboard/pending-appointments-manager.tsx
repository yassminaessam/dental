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
import { getCollection, updateDocument } from '@/services/firestore';
import type { Appointment } from '@/app/appointments/page';

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
      const appointments = await getCollection<Appointment>('appointments');
      const pending = appointments?.filter(apt => 
        apt.status === 'Pending'
      ).sort((a, b) => {
        // Sort by urgency first, then by date
        const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const urgencyA = urgencyOrder[(a as any).urgency as keyof typeof urgencyOrder] || 2;
        const urgencyB = urgencyOrder[(b as any).urgency as keyof typeof urgencyOrder] || 2;
        
        if (urgencyA !== urgencyB) {
          return urgencyB - urgencyA; // High urgency first
        }
        
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }) || [];
      
      setPendingAppointments(pending);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load pending appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string, assignedDoctor: string) => {
    setActionLoading(appointmentId);
    try {
      await updateDocument('appointments', appointmentId, {
        status: 'Confirmed',
        doctor: assignedDoctor,
        confirmedAt: new Date().toISOString(),
        confirmedBy: `${user?.firstName} ${user?.lastName}`,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Appointment Confirmed",
        description: `Appointment has been confirmed and assigned to ${assignedDoctor}`
      });

      fetchPendingAppointments();
      onAppointmentUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm appointment",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointment = async (appointmentId: string, reason: string) => {
    setActionLoading(appointmentId);
    try {
      await updateDocument('appointments', appointmentId, {
        status: 'Cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: `${user?.firstName} ${user?.lastName}`,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Appointment Rejected",
        description: "The appointment request has been rejected"
      });

      fetchPendingAppointments();
      onAppointmentUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject appointment",
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
            Pending Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">Loading pending appointments...</div>
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
            Pending Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>No pending appointments</p>
            <p className="text-sm">All appointment requests have been processed</p>
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
            Pending Appointments
          </div>
          <Badge variant="destructive">
            {pendingAppointments.length} pending
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
  getUrgencyColor
}: {
  appointment: Appointment;
  date: string;
  time: string;
  isLoading: boolean;
  onConfirm: (id: string, doctor: string) => void;
  onReject: (id: string, reason: string) => void;
  getUrgencyColor: (urgency: string) => "default" | "destructive" | "outline" | "secondary";
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
              {(appointment as any).urgency || 'Medium'} Priority
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
          <span className="font-medium">Type:</span> {appointment.type}
        </div>
        <div>
          <span className="font-medium">Duration:</span> {appointment.duration || 60} minutes
        </div>
      </div>

      {(appointment as any).reason && (
        <div>
          <span className="font-medium text-sm">Reason:</span>
          <p className="text-sm text-muted-foreground mt-1">{(appointment as any).reason}</p>
        </div>
      )}

      {appointment.notes && (
        <div>
          <span className="font-medium text-sm">Notes:</span>
          <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
        <div className="flex-1">
          <Label htmlFor={`doctor-${appointment.id}`} className="text-sm font-medium">
            Assign Doctor
          </Label>
          <Select
            value={selectedDoctor}
            onValueChange={setSelectedDoctor}
            disabled={isLoading}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a doctor" />
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
            Confirm
          </Button>

          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isLoading} className="flex-1 sm:flex-initial">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Appointment Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectReason">Reason for rejection</Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this appointment..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(false)}
                    className="flex-1"
                  >
                    Cancel
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
                    Reject Appointment
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
