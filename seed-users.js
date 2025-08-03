const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with service account (you would need to set this up in production)
// For demo purposes, we'll use the default credentials
try {
  initializeApp();
} catch (error) {
  console.log('Firebase already initialized or error:', error.message);
}

const auth = getAuth();
const db = getFirestore();

const ROLE_PERMISSIONS = {
  'admin': ['read', 'write', 'delete', 'manage_users', 'view_reports', 'manage_settings'],
  'doctor': ['read', 'write', 'view_medical_records', 'prescribe', 'view_reports'],
  'receptionist': ['read', 'write', 'schedule_appointments', 'manage_billing'],
  'patient': ['read', 'view_own_records', 'book_appointments']
};

const demoUsers = [
  {
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    role: 'admin',
    firstName: 'Dr. Sarah',
    lastName: 'Ahmed',
    phone: '+201234567890'
  },
  {
    email: 'doctor@cairodental.com',
    password: 'Doctor123!',
    role: 'doctor',
    firstName: 'Dr. Mohamed',
    lastName: 'Hassan',
    phone: '+201234567891'
  },
  {
    email: 'receptionist@cairodental.com',
    password: 'Receptionist123!',
    role: 'receptionist',
    firstName: 'Fatima',
    lastName: 'Ali',
    phone: '+201234567892'
  },
  {
    email: 'patient@cairodental.com',
    password: 'Patient123!',
    role: 'patient',
    firstName: 'Ahmed',
    lastName: 'Mahmoud',
    phone: '+201234567893'
  }
];

async function seedUsers() {
  console.log('Starting to seed demo users...');
  
  for (const user of demoUsers) {
    try {
      // Check if user already exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`User ${user.email} already exists, updating...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await auth.createUser({
            email: user.email,
            password: user.password,
            displayName: `${user.firstName} ${user.lastName}`,
          });
          console.log(`Created user: ${user.email}`);
        } else {
          throw error;
        }
      }

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, { 
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role] || []
      });

      // Create user document in Firestore
      const userDoc = {
        id: userRecord.uid,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      await db.collection('users').doc(userRecord.uid).set(userDoc);
      console.log(`Saved user document for: ${user.email}`);

    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  console.log('Demo users seeding completed!');
  console.log('\nDemo Login Credentials:');
  console.log('=======================');
  demoUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

seedUsers().catch(console.error);
