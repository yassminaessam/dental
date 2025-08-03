'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  FileText,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocument, getCollection } from '@/services/firestore';
import { format } from 'date-fns';
import type { Appointment } from '@/app/appointments/page';

interface PendingAppointmentsProps {
  onAppointmentConfirmed?: () => void;
}

export default function PendingAppointmentsManager({ onAppointmentConfirmed }: PendingAppointmentsProps) {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingAppointments();
    
    // Refresh every 30 seconds to catch new pending appointments
    const interval = setInterval(fetchPendingAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const appointments = await getCollection<Appointment>('appointments');
      const pending = (appointments || [])
        .filter(apt => apt.status === 'Pending')
        .map(apt => ({ ...apt, dateTime: new Date(apt.dateTime) }))
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      
      setPendingAppointments(pending);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    setConfirmingIds(prev => new Set(prev).add(appointmentId));
    
    try {
      await updateDocument('appointments', appointmentId, { 
        status: 'Confirmed',
        confirmedAt: new Date(),
        confirmedBy: 'staff' // You can get actual user info from auth context
      });
      
      toast({
        title: "Appointment Confirmed",
        description: "The patient will be notified of the confirmation."
      });
      
      // Remove from pending list
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      if (onAppointmentConfirmed) {
        onAppointmentConfirmed();
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfirmingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    const notes = rejectionNotes[appointmentId];
    if (!notes || notes.trim() === '') {
      toast({
        title: "Rejection Note Required",
        description: "Please provide a reason for rejecting this appointment.",
        variant: "destructive"
      });
      return;
    }

    setConfirmingIds(prev => new Set(prev).add(appointmentId));
    
    try {
      await updateDocument('appointments', appointmentId, { 
        status: 'Cancelled',
        rejectedAt: new Date(),
        rejectedBy: 'staff',
        rejectionReason: notes
      });
      
      toast({
        title: "Appointment Rejected",
        description: "The patient will be notified with the reason provided."
      });
      
      // Remove from pending list
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Clear rejection notes
      setRejectionNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[appointmentId];
        return newNotes;
      });
      
      if (onAppointmentConfirmed) {
        onAppointmentConfirmed();
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reject appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfirmingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading pending appointments...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Pending Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No pending appointments at this time. All appointment requests have been reviewed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            Pending Appointments
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingAppointments.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingAppointments.map((appointment) => {
            const isProcessing = confirmingIds.has(appointment.id);
            
            return (
              <Card key={appointment.id} className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Patient Info */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{appointment.patient}</span>
                          {appointment.bookedBy === 'patient' && (
                            <Badge variant="outline" className="text-xs">
                              Self-booked
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{appointment.patientEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.patientPhone}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {appointment.status}
                      </Badge>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-600" />
                        <span>{format(appointment.dateTime, 'PPP')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span>{format(appointment.dateTime, 'p')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-600" />
                        <span>Dr. {appointment.doctor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-gray-600" />
                        <span>{appointment.type} ({appointment.duration})</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="bg-white/50 p-2 rounded border-l-2 border-orange-300">
                        <Label className="text-xs text-gray-600">Patient Notes:</Label>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Rejection Notes Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`rejection-notes-${appointment.id}`} className="text-sm">
                        Rejection Reason (if declining):
                      </Label>
                      <Textarea
                        id={`rejection-notes-${appointment.id}`}
                        placeholder="Provide a reason for rejecting this appointment..."
                        value={rejectionNotes[appointment.id] || ''}
                        onChange={(e) => setRejectionNotes(prev => ({
                          ...prev,
                          [appointment.id]: e.target.value
                        }))}
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Confirm Appointment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectAppointment(appointment.id)}
                        disabled={isProcessing || !rejectionNotes[appointment.id]?.trim()}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
