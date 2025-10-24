import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { ROLE_PERMISSIONS } from '@/lib/types';

const seedUsers = [
  {
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin' as const,
    phone: '+201000000000'
  },
  {
    email: 'doctor@cairodental.com',
    password: 'Doctor123!',
    firstName: 'Dr.',
    lastName: 'Mohamed Hassan',
    role: 'doctor' as const,
    phone: '+201234567891'
  },
  {
    email: 'receptionist@cairodental.com',
    password: 'Receptionist123!',
    firstName: 'Fatima',
    lastName: 'Ali',
    role: 'receptionist' as const,
    phone: '+201234567892'
  },
  {
    email: 'patient@cairodental.com',
    password: 'Patient123!',
    firstName: 'Ahmed',
    lastName: 'Mahmoud',
    role: 'patient' as const,
    phone: '+201234567893'
  },
];

async function main() {
  for (const user of seedUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role],
        isActive: true,
        phone: user.phone,
      },
      create: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role],
        isActive: true,
        phone: user.phone,
      },
    });
    console.log(`Seeded user ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed users', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
