import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ROLE_PERMISSIONS } from './types';
import type { User, UserRole } from './types';

// Firebase config (same as in firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAyhz89y2Y9ucaB2xi5xFAcALhkMH-HBIY",
  authDomain: "dental-a627d.firebaseapp.com",
  projectId: "dental-a627d",
  storageBucket: "dental-a627d.firebasestorage.app",
  messagingSenderId: "61708021549",
  appId: "1:61708021549:web:682cd642b856c0f35f2da4",
  measurementId: "G-KZZD0JR71E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

async function createDemoUser(userData: any) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );

    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      permissions: ROLE_PERMISSIONS[userData.role as UserRole],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: userData.phone,
      specialization: userData.specialization,
      licenseNumber: userData.licenseNumber,
      employeeId: userData.employeeId,
      department: userData.department,
      patientId: userData.patientId,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  User already exists: ${userData.email}`);
    } else {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
    return null;
  }
}

async function seedUsers() {
  console.log('🌱 Starting to seed demo users...');
  
  try {
    for (const userData of demoUsers) {
      await createDemoUser(userData);
    }
    
    console.log('\n✅ Demo users seeding completed!');
    console.log('\n📋 Demo credentials:');
    console.log('Admin: admin@dental.com / admin123');
    console.log('Doctor: doctor@dental.com / doctor123');
    console.log('Receptionist: receptionist@dental.com / reception123');
    console.log('Patient: patient@dental.com / patient123');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers().then(() => process.exit(0));
}

export { seedUsers };
