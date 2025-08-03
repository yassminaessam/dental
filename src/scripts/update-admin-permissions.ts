// Script to update admin permissions with new patient portal permissions
// Run this once to update existing admin users

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ADMIN_USER_ID = 'rolltlh0UIXrceBiQ7iPRDBbYEV2'; // From your database

export async function updateAdminPermissions() {
  try {
    console.log('Updating admin permissions...');
    
    // Get current user data
    const userRef = doc(db, 'users', ADMIN_USER_ID);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('Admin user not found');
      return;
    }
    
    const userData = userDoc.data();
    const currentPermissions = userData.permissions || [];
    
    console.log('Current permissions:', currentPermissions);
    
    // Add new patient portal permissions if they don't exist
    const newPermissions = [
      'view_patient_portal',
      'edit_patient_portal'
    ];
    
    const updatedPermissions = [...currentPermissions];
    
    newPermissions.forEach(permission => {
      if (!updatedPermissions.includes(permission)) {
        updatedPermissions.push(permission);
        console.log(`Adding permission: ${permission}`);
      }
    });
    
    // Update the user document
    await updateDoc(userRef, {
      permissions: updatedPermissions,
      updatedAt: new Date()
    });
    
    console.log('Admin permissions updated successfully!');
    console.log('New permissions:', updatedPermissions);
    
  } catch (error) {
    console.error('Error updating admin permissions:', error);
  }
}

// Also export a function to update all admin users
export async function updateAllAdminUsers() {
  try {
    console.log('This would update all admin users - implement if needed');
    // You can expand this to query all users with role 'admin' and update them
  } catch (error) {
    console.error('Error updating all admin users:', error);
  }
}
