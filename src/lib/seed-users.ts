// Deprecated Firebase seeding script. Replaced by Neon/Prisma seeds.
// Keeping file as stub to avoid breaking references.
import { ROLE_PERMISSIONS } from './types';
import type { User, UserRole } from './types';

console.warn('[legacy] seed-users.ts is deprecated and performs no actions.');

// Removed firebase initialization.

// Demo users data
const demoUsers = [
  {
    email: 'admin@dental.com',
    password: 'admin123',
    firstName: 'Sarah',
    lastName: 'Ahmed',
    role: 'admin' as UserRole,
    phone: '+20 1234567890',
    employeeId: 'EMP001',
    department: 'Administration',
  },
  {
    email: 'doctor@dental.com',
    password: 'doctor123',
    firstName: 'Dr. Mohamed',
    lastName: 'Hassan',
    role: 'doctor' as UserRole,
    phone: '+20 1234567891',
    specialization: 'Orthodontics',
    licenseNumber: 'LIC-2024-001',
  },
  {
    email: 'receptionist@dental.com',
    password: 'reception123',
    firstName: 'Fatima',
    lastName: 'Ali',
    role: 'receptionist' as UserRole,
    phone: '+20 1234567892',
    employeeId: 'EMP002',
    department: 'Front Desk',
  },
  {
    email: 'patient@dental.com',
    password: 'patient123',
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    role: 'patient' as UserRole,
    phone: '+20 1234567893',
    patientId: 'PAT-175410256872', // Link to existing patient data
  },
];

async function createDemoUser(_userData: any) { console.log('legacy createDemoUser noop'); return null; }

async function seedUsers() { console.log('legacy seedUsers noop'); }

// Run if called directly
if (require.main === module) { seedUsers().then(() => process.exit(0)); }

export { seedUsers };
