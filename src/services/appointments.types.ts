import type { Appointment, AppointmentStatus } from '@/lib/types';

export interface AppointmentCreateInput {
  id?: string;
  dateTime: Date;
  patient: string;
  patientId?: string;
  patientEmail?: string;
  patientPhone?: string;
  doctor: string;
  doctorId?: string;
  type: string;
  duration: string;
  status?: AppointmentStatus;
  treatmentId?: string;
  notes?: string;
  bookedBy?: Appointment['bookedBy'];
  reason?: Appointment['reason'];
  urgency?: Appointment['urgency'];
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date | null;
  confirmedBy?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  rejectedBy?: string | null;
}

export type AppointmentUpdateInput = Partial<Omit<Appointment, 'id'>>;
