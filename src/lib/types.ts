
export type Message = {
  id: string;
  patient: string;
  patientPhone?: string | null;
  type: 'SMS' | 'Email';
  content: string;
  subContent: string | null;
  status: 'Sent' | 'Delivered' | 'Read' | 'Unread';
  sent: string;
  subject?: string;
  snippet?: string;
  fullMessage?: string;
  category?: 'treatment' | 'appointment' | 'billing' | 'other';
  priority?: 'high' | 'normal' | 'low';
  date?: string;
};

// Authentication Types
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export type UserPermission = 
  | 'view_patients' | 'edit_patients' | 'delete_patients'
  | 'view_appointments' | 'edit_appointments' | 'delete_appointments'
  | 'view_treatments' | 'edit_treatments' | 'delete_treatments'
  | 'view_billing' | 'edit_billing' | 'delete_billing'
  | 'view_reports' | 'edit_reports'
  | 'view_staff' | 'edit_staff' | 'delete_staff'
  | 'view_inventory' | 'edit_inventory' | 'delete_inventory'
  | 'view_settings' | 'edit_settings'
  | 'view_medical_records' | 'edit_medical_records'
  | 'view_dental_chart' | 'edit_dental_chart'
  | 'view_communications' | 'send_communications'
  | 'view_insurance' | 'edit_insurance'
  | 'view_analytics' | 'view_own_data'
  | 'view_patient_portal' | 'edit_patient_portal'
  | 'view_pharmacy' | 'edit_pharmacy' | 'delete_pharmacy'
  | 'view_prescriptions' | 'edit_prescriptions' | 'delete_prescriptions'
  | 'view_purchase_orders' | 'edit_purchase_orders' | 'delete_purchase_orders'
  | 'view_referrals' | 'edit_referrals' | 'delete_referrals'
  | 'view_financial' | 'edit_financial' | 'delete_financial'
  | 'view_suppliers' | 'edit_suppliers' | 'delete_suppliers'
  | 'view_chats' | 'send_chats' | 'delete_chats'
  | 'view_users' | 'edit_users' | 'delete_users'
  | 'view_help' | 'edit_help';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: UserPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Role-specific fields
  specialization?: string; // For doctors
  licenseNumber?: string; // For doctors
  employeeId?: string; // For staff
  department?: string; // For staff
  patientId?: string; // For patients - link to patient records
  
  // Profile information
  phone?: string;
  address?: string;
  profileImageUrl?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  employeeId?: string;
  department?: string;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  admin: [
    'view_patients', 'edit_patients', 'delete_patients',
    'view_appointments', 'edit_appointments', 'delete_appointments',
    'view_treatments', 'edit_treatments', 'delete_treatments',
    'view_billing', 'edit_billing', 'delete_billing',
    'view_reports', 'edit_reports',
    'view_staff', 'edit_staff', 'delete_staff',
    'view_inventory', 'edit_inventory', 'delete_inventory',
    'view_settings', 'edit_settings',
    'view_medical_records', 'edit_medical_records',
    'view_dental_chart', 'edit_dental_chart',
    'view_communications', 'send_communications',
    'view_insurance', 'edit_insurance',
    'view_analytics',
    'view_patient_portal', 'edit_patient_portal',
    'view_pharmacy', 'edit_pharmacy', 'delete_pharmacy',
    'view_prescriptions', 'edit_prescriptions', 'delete_prescriptions',
    'view_purchase_orders', 'edit_purchase_orders', 'delete_purchase_orders',
    'view_referrals', 'edit_referrals', 'delete_referrals',
    'view_financial', 'edit_financial', 'delete_financial',
    'view_suppliers', 'edit_suppliers', 'delete_suppliers',
    'view_chats', 'send_chats', 'delete_chats',
    'view_users', 'edit_users', 'delete_users',
    'view_help', 'edit_help'
  ],
  doctor: [
    'view_patients', 'edit_patients',
    'view_appointments', 'edit_appointments',
    'view_treatments', 'edit_treatments',
    'view_billing',
    'view_medical_records', 'edit_medical_records',
    'view_dental_chart', 'edit_dental_chart',
    'view_communications', 'send_communications',
    'view_insurance',
    'view_analytics',
    'view_pharmacy', 'edit_pharmacy',
    'view_prescriptions', 'edit_prescriptions',
    'view_referrals', 'edit_referrals',
    'view_chats', 'send_chats',
    'view_help'
  ],
  receptionist: [
    'view_patients', 'edit_patients',
    'view_appointments', 'edit_appointments',
    'view_billing', 'edit_billing',
    'view_communications', 'send_communications',
    'view_insurance', 'edit_insurance',
    'view_inventory',
    'view_pharmacy',
    'view_prescriptions',
    'view_suppliers',
    'view_referrals',
    'view_chats', 'send_chats',
    'view_help'
  ],
  patient: [
    'view_own_data'
  ]
};

export type PatientStatus = 'Active' | 'Inactive';

export interface PatientMedicalHistoryEntry {
  condition: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  age: number;
  lastVisit: string;
  status: PatientStatus;
  address?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelationship?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: PatientMedicalHistoryEntry[];
}

export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';

export type AppointmentBookedBy = 'patient' | 'staff';

export type AppointmentUrgency = 'Low' | 'Medium' | 'High';

export interface Appointment {
  id: string;
  dateTime: Date;
  patient: string;
  patientId?: string;
  patientEmail?: string;
  patientPhone?: string;
  doctor: string;
  doctorId?: string;
  type: string;
  duration: string;
  status: AppointmentStatus;
  treatmentId?: string;
  notes?: string;
  bookedBy?: AppointmentBookedBy;
  createdAt?: Date;
  updatedAt?: Date;
  reason?: string;
  urgency?: AppointmentUrgency;
  confirmedAt?: Date;
  confirmedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  rejectedBy?: string;
}

export type StaffStatus = 'Active' | 'Inactive';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  schedule: string;
  salary: string;
  hireDate: string;
  status: StaffStatus;
  notes?: string;
  userId?: string;
}

export type TreatmentStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TreatmentAppointment {
  date: Date;
  time: string;
  duration: string;
  status: AppointmentStatus;
  appointmentId?: string;
}

export interface Treatment {
  id: string;
  date: string;
  patient: string;
  patientId?: string;
  doctor: string;
  doctorId?: string;
  procedure: string;
  cost: string;
  status: TreatmentStatus;
  notes?: string;
  appointments: TreatmentAppointment[];
}

export type MedicalRecordStatus = 'Final' | 'Draft';

export interface MedicalRecord {
  id: string;
  patient: string;
  patientId?: string;
  type: string;
  complaint: string;
  provider: string;
  providerId?: string;
  date: string;
  status: MedicalRecordStatus;
  notes?: string;
}

export interface MedicalRecordTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
}

export interface ClinicalImage {
  id: string;
  patient: string;
  patientId?: string;
  type: string;
  date: string;
  imageUrl: string;
  caption?: string;
  toothNumber?: number;
}
