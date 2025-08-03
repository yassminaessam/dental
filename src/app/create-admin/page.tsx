'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function CreateAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const adminUser = {
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+201000000000',
    role: 'admin' as const
  };

  const createAdminUser = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await AuthService.register(adminUser);
      setIsCreated(true);
      toast({
        title: "Admin Created!",
        description: "System administrator account has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      let errorMessage = 'Failed to create admin user';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Admin account already exists. You can sign in with the existing credentials.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {isCreated ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <UserPlus className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <CardTitle>
            {isCreated ? 'Admin Created!' : 'Create System Administrator'}
          </CardTitle>
          <CardDescription>
            {isCreated 
              ? 'Your admin account has been created successfully.' 
              : 'Create the first admin user for your dental clinic system.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isCreated ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Admin Credentials:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div><strong>Email:</strong> {adminUser.email}</div>
                  <div><strong>Password:</strong> {adminUser.password}</div>
                  <div><strong>Role:</strong> Administrator</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Next Steps:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Go to the login page</li>
                  <li>2. Sign in with the admin credentials above</li>
                  <li>3. Navigate to Admin → User Management</li>
                  <li>4. Create additional users for your clinic</li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = '/login'} 
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Admin Account Details:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Email:</strong> {adminUser.email}</div>
                  <div><strong>Password:</strong> {adminUser.password}</div>
                  <div><strong>Name:</strong> {adminUser.firstName} {adminUser.lastName}</div>
                  <div><strong>Role:</strong> Administrator</div>
                </div>
              </div>

              <Button 
                onClick={createAdminUser} 
                disabled={isLoading} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  'Create Admin User'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
