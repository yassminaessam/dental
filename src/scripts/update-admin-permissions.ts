// Script to update admin permissions (Postgres)
import { UsersService } from '@/services/users';

const ADMIN_USER_ID = 'rolltlh0UIXrceBiQ7iPRDBbYEV2'; // From your database

export async function updateAdminPermissions() {
  try {
    console.log('Updating admin permissions...');
    const user = await UsersService.getById(ADMIN_USER_ID);
    if (!user) { console.error('Admin user not found'); return; }
    const currentPermissions = user.permissions || [];
    
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
    
    await UsersService.update(ADMIN_USER_ID, { permissions: updatedPermissions });
    
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
