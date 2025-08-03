const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with project ID
try {
  initializeApp({
    projectId: 'dental-a627d' // Use the project ID from Firebase config
  });
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

const adminUser = {
  email: 'admin@cairodental.com',
  password: 'Admin123!',
  role: 'admin',
  firstName: 'System',
  lastName: 'Administrator',
  phone: '+201000000000'
};

async function createAdminUser() {
  console.log('Creating system administrator account...');
  
  try {
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminUser.email);
      console.log(`User ${adminUser.email} already exists, updating...`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await auth.createUser({
          email: adminUser.email,
          password: adminUser.password,
          displayName: `${adminUser.firstName} ${adminUser.lastName}`,
        });
        console.log(`Created admin user: ${adminUser.email}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, { 
      role: adminUser.role,
      permissions: ROLE_PERMISSIONS[adminUser.role] || []
    });

    // Create user document in Firestore
    const userDoc = {
      id: userRecord.uid,
      email: adminUser.email,
      role: adminUser.role,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      phone: adminUser.phone,
      permissions: ROLE_PERMISSIONS[adminUser.role] || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);
    console.log(`Saved admin user document`);

    console.log('\n✅ Admin user created successfully!');
    console.log('================================');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Role: ${adminUser.role.toUpperCase()}`);
    console.log('\nYou can now:');
    console.log('1. Go to http://localhost:9002/login');
    console.log('2. Sign in with the admin credentials above');
    console.log('3. Navigate to Admin > User Management to create more users');
    console.log('4. Or use the registration page to create new accounts');

  } catch (error) {
    console.error(`Error creating admin user:`, error);
  }
}

createAdminUser().catch(console.error);
