'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setDocument, getCollection } from '@/services/firestore';
import type { Appointment } from '@/app/appointments/page';
import { format, addDays, setHours, setMinutes, parseISO, isSameDay, isBefore } from 'date-fns';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: {
    [key: string]: string[]; // day: available time slots
  };
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
}

const APPOINTMENT_TYPES: AppointmentType[] = [
  { id: 'consultation', name: 'Consultation', duration: 30, description: 'Initial examination and consultation' },
  { id: 'cleaning', name: 'Dental Cleaning', duration: 60, description: 'Professional teeth cleaning' },
  { id: 'filling', name: 'Dental Filling', duration: 45, description: 'Tooth filling or restoration' },
  { id: 'extraction', name: 'Tooth Extraction', duration: 30, description: 'Tooth removal procedure' },
  { id: 'whitening', name: 'Teeth Whitening', duration: 90, description: 'Professional teeth whitening treatment' },
  { id: 'checkup', name: 'Regular Checkup', duration: 30, description: 'Routine dental examination' },
  { id: 'emergency', name: 'Emergency Visit', duration: 45, description: 'Urgent dental care' }
];

const AVAILABLE_DOCTORS: Doctor[] = [
  {
    id: 'dr-smith',
    name: 'Dr. Smith',
    specialization: 'General Dentistry',
    availability: {
      monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      friday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      saturday: ['09:00', '10:00', '11:00'],
      sunday: []
    }
  },
  {
    id: 'dr-johnson',
    name: 'Dr. Johnson',
    specialization: 'Orthodontics',
    availability: {
      monday: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      tuesday: ['09:00', '10:00', '14:00', '15:00', '16:00'],
      wednesday: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      thursday: ['10:00', '11:00', '14:00', '15:00'],
      friday: ['09:00', '10:00', '14:00', '15:00'],
      saturday: ['09:00', '10:00'],
      sunday: []
    }
  },
  {
    id: 'dr-brown',
    name: 'Dr. Brown',
    specialization: 'Oral Surgery',
    availability: {
      monday: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      tuesday: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      wednesday: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      thursday: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      friday: ['08:00', '09:00', '10:00', '14:00'],
      saturday: [],
      sunday: []
    }
  }
];

export default function PatientBookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Computed states
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing appointments to check availability
    fetchExistingAppointments();
  }, []);

  useEffect(() => {
    // Update available times when date or doctor changes
    if (selectedDate && selectedDoctor) {
      updateAvailableTimes();
    }
  }, [selectedDate, selectedDoctor, existingAppointments]);

  const fetchExistingAppointments = async () => {
    try {
      const appointments = await getCollection<Appointment>('appointments');
      setExistingAppointments(appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const updateAvailableTimes = () => {
    if (!selectedDate || !selectedDoctor) return;

    const doctor = AVAILABLE_DOCTORS.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const doctorAvailability = doctor.availability[dayName] || [];

    // Filter out times that are already booked
    const bookedTimes = existingAppointments
      .filter(apt => 
        apt.doctor === doctor.name && 
        isSameDay(new Date(apt.dateTime), selectedDate) &&
        apt.status !== 'Cancelled'
      )
      .map(apt => format(new Date(apt.dateTime), 'HH:mm'));

    const availableTimes = doctorAvailability.filter(time => !bookedTimes.includes(time));
    setAvailableTimes(availableTimes);
    
    // Reset selected time if it's no longer available
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setSelectedTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedDoctor || !selectedType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const doctor = AVAILABLE_DOCTORS.find(d => d.id === selectedDoctor);
      const appointmentType = APPOINTMENT_TYPES.find(t => t.id === selectedType);
      
      if (!doctor || !appointmentType) {
        throw new Error('Invalid doctor or appointment type selected');
      }

      // Create the appointment date/time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDateTime = setMinutes(setHours(selectedDate, hours), minutes);

      // Check if the slot is still available (double-check)
      const conflictingAppointment = existingAppointments.find(apt =>
        apt.doctor === doctor.name &&
        isSameDay(new Date(apt.dateTime), appointmentDateTime) &&
        format(new Date(apt.dateTime), 'HH:mm') === selectedTime &&
        apt.status !== 'Cancelled'
      );

      if (conflictingAppointment) {
        throw new Error('This time slot is no longer available. Please select a different time.');
      }

      const newAppointment: Omit<Appointment, 'id'> = {
        dateTime: appointmentDateTime,
        patient: `${user.firstName} ${user.lastName}`,
        patientEmail: user.email,
        patientPhone: phone,
        doctor: doctor.name,
        type: appointmentType.name,
        duration: `${appointmentType.duration} min`,
        status: 'Pending', // Patient bookings start as pending
        notes,
        bookedBy: 'patient',
        createdAt: new Date()
      };

      const appointmentId = `APT-${Date.now()}`;
      await setDocument('appointments', appointmentId, newAppointment);

      toast({
        title: "Appointment Requested",
        description: `Your appointment has been requested for ${format(appointmentDateTime, 'PPP')} at ${selectedTime}. You will receive a confirmation once approved.`
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedDoctor('');
      setSelectedType('');
      setNotes('');
      setIsOpen(false);

      // Refresh appointments
      fetchExistingAppointments();

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorData = AVAILABLE_DOCTORS.find(d => d.id === selectedDoctor);
  const selectedAppointmentType = APPOINTMENT_TYPES.find(t => t.id === selectedType);

  // Don't allow booking appointments in the past
  const minDate = new Date();
  const maxDate = addDays(new Date(), 60); // Allow booking up to 60 days in advance

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Book New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Date and Time Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="appointment-type">Appointment Type *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.duration} min - {type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="doctor">Preferred Doctor *</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_DOCTORS.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">{doctor.specialization}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, minDate) || date > maxDate}
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* Right Column - Time and Details */}
            <div className="space-y-4">
              {selectedDate && selectedDoctorData && (
                <div>
                  <Label>Available Times *</Label>
                  <div className="mt-2">
                    {availableTimes.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No available times for {selectedDoctorData.name} on {format(selectedDate, 'PPP')}. Please select a different date or doctor.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or requests..."
                  rows={3}
                />
              </div>

              {/* Appointment Summary */}
              {selectedDate && selectedTime && selectedDoctorData && selectedAppointmentType && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Appointment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{selectedDoctorData.name} - {selectedDoctorData.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(selectedDate, 'PPP')} at {selectedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedAppointmentType.name} ({selectedAppointmentType.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{phone}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your appointment request will be reviewed by our staff and you'll receive a confirmation email once approved.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedDate || !selectedTime || !selectedDoctor || !selectedType}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Request Appointment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
