'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { updateDocument, getDocument } from '@/services/database';

export default function UpdatePermissionsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const updateAdminPermissions = async () => {
    setIsUpdating(true);
    setResult(null);
    setMessage('');

    try {
      const ADMIN_USER_ID = 'rolltlh0UIXrceBiQ7iPRDBbYEV2';
      
      // Get current user data
      const userData = await getDocument('user', ADMIN_USER_ID);
      
      if (!userData) {
        throw new Error('Admin user not found');
      }
      const currentPermissions = (userData as any).permissions || [];
      
      // Add new patient portal permissions if they don't exist
      const newPermissions = [
        'view_patient_portal',
        'edit_patient_portal'
      ];
      
      const updatedPermissions = [...currentPermissions];
      let addedCount = 0;
      
      newPermissions.forEach(permission => {
        if (!updatedPermissions.includes(permission)) {
          updatedPermissions.push(permission);
          addedCount++;
        }
      });
      
      if (addedCount === 0) {
        setMessage('Admin user already has patient portal permissions!');
        setResult('success');
        return;
      }
      
      // Update the user document
      await updateDocument('user', ADMIN_USER_ID, {
        permissions: updatedPermissions,
        updatedAt: new Date()
      });
      
      setMessage(`Successfully added ${addedCount} patient portal permissions to admin user!`);
      setResult('success');
      
    } catch (error) {
      console.error('Error updating admin permissions:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult('error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Update Admin Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will add the new patient portal permissions (view_patient_portal, edit_patient_portal) 
            to your admin user account.
          </p>
          
          {result && (
            <Alert variant={result === 'success' ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {result === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </div>
            </Alert>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">Permissions to be added:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>view_patient_portal - View patient portal management</li>
              <li>edit_patient_portal - Edit patient portal content and promotions</li>
            </ul>
          </div>
          
          <Button 
            onClick={updateAdminPermissions} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Permissions...
              </>
            ) : (
              'Update Admin Permissions'
            )}
          </Button>
          
          {result === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Permissions updated! You can now access the Patient Portal management.
              </p>
              <Button variant="outline" asChild>
                <a href="/patient-home-admin">Go to Patient Portal Admin</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
