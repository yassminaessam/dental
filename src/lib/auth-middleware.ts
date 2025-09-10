// Authentication Middleware for Neon-based auth
import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    isActive: boolean;
  };
}

/**
 * Middleware to authenticate requests using Neon auth service
 */
export async function authenticateRequest(request: AuthenticatedRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token with Neon auth service
    const user = await neonAuth.verifyToken(token);

    if (!user) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
      
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });

      return response;
    }

    // Attach user to request
    request.user = user;
    
    return null; // No response means authentication successful

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(user: any, permission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user: any, permissions: string[]): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Check if user has required role
 */
export function hasRole(user: any, role: string): boolean {
  if (!user) {
    return false;
  }

  return user.role === role;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: any, roles: string[]): boolean {
  if (!user) {
    return false;
  }

  return roles.includes(user.role);
}

/**
 * Middleware wrapper for routes that require authentication
 */
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authRequest = request as AuthenticatedRequest;
    
    // Check authentication
    const authResponse = await authenticateRequest(authRequest);
    
    if (authResponse) {
      return authResponse; // Return error response
    }

    // Call the actual handler
    return handler(authRequest);
  };
}

/**
 * Middleware wrapper for routes that require specific permissions
 */
export function withPermission(permission: string, handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (request: AuthenticatedRequest) => {
    if (!hasPermission(request.user, permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request);
  });
}

/**
 * Middleware wrapper for routes that require specific role
 */
export function withRole(role: string, handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (request: AuthenticatedRequest) => {
    if (!hasRole(request.user, role)) {
      return NextResponse.json(
        { error: 'Insufficient role privileges' },
        { status: 403 }
      );
    }

    return handler(request);
  });
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return null;
    }

    return await neonAuth.getCurrentUser(token);

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}