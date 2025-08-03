
export type Message = {
  id: string;
  patient: string;
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
  | 'view_inventory' | 'edit_inventory'
  | 'view_settings' | 'edit_settings'
  | 'view_medical_records' | 'edit_medical_records'
  | 'view_dental_chart' | 'edit_dental_chart'
  | 'view_communications' | 'send_communications'
  | 'view_insurance' | 'edit_insurance'
  | 'view_analytics' | 'view_own_data'
  | 'view_patient_portal' | 'edit_patient_portal';

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
    'view_inventory', 'edit_inventory',
    'view_settings', 'edit_settings',
    'view_medical_records', 'edit_medical_records',
    'view_dental_chart', 'edit_dental_chart',
    'view_communications', 'send_communications',
    'view_insurance', 'edit_insurance',
    'view_analytics',
    'view_patient_portal', 'edit_patient_portal'
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
    'view_analytics'
  ],
  receptionist: [
    'view_patients', 'edit_patients',
    'view_appointments', 'edit_appointments',
    'view_billing', 'edit_billing',
    'view_communications', 'send_communications',
    'view_insurance', 'edit_insurance',
    'view_inventory'
  ],
  patient: [
    'view_own_data'
  ]
};
