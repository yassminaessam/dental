'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, User, Lock, Activity, Shield, Stethoscope, Users, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Test credentials for quick login
const testUsers = [
  {
    role: 'Admin',
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    hoverColor: 'hover:bg-purple-500/20'
  },
  {
    role: 'Doctor',
    email: 'doctor2@cairodental.com',
    password: 'Doctor@123',
    icon: Stethoscope,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    hoverColor: 'hover:bg-blue-500/20'
  },
  {
    role: 'Receptionist',
    email: 'receptionist@cairodental.com',
    password: 'Receptionist@123',
    icon: Users,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600',
    hoverColor: 'hover:bg-green-500/20'
  },
  {
    role: 'Patient',
    email: 'patient@cairodental.com',
    password: 'Patient@123',
    icon: UserCircle,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    hoverColor: 'hover:bg-amber-500/20'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      router.push('/'); // Redirect to dashboard
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setIsLoading(true);

    try {
      await signIn(testEmail, testPassword);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      router.push('/'); // Redirect to dashboard
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Side - Main Login */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="inline-flex h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cairo Dental Clinic</h1>
            <p className="text-blue-200">Sign in to access your account</p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <Link href="/forgot-password" className="w-full">
                  <Button type="button" variant="ghost" className="w-full text-sm text-muted-foreground hover:text-primary">
                    Forgot your password?
                  </Button>
                </Link>
              </CardFooter>
            </form>
          </Card>

          {/* Registration Link */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  New patient?
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full h-11 border-2 hover:bg-blue-50">
                    Register as Patient
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-blue-200">
            <p>© 2025 Cairo Dental Clinic. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Test Login Section */}
        <div className="space-y-6">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                Quick Test Login
              </CardTitle>
              <CardDescription>
                Click any button below to instantly login as a test user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testUsers.map((user) => {
                const IconComponent = user.icon;
                return (
                  <Button
                    key={user.role}
                    onClick={() => handleTestLogin(user.email, user.password)}
                    disabled={isLoading}
                    variant="outline"
                    className={`w-full h-auto py-4 px-4 ${user.bgColor} ${user.hoverColor} border-0 hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-semibold text-base ${user.textColor}`}>
                          {user.role}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {user.email}
                        </div>
                      </div>
                      {isLoading && (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur border-blue-300/30 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Test Accounts</p>
                    <p className="text-gray-600 text-xs">These are demo accounts for testing different user roles and permissions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instant Access</p>
                    <p className="text-gray-600 text-xs">Click any button to instantly login without typing credentials.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
