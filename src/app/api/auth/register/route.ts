import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dental_clinic_jwt_secret_key_2025_very_secure_random_string_for_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      permissions,
      specialization,
      licenseNumber,
      employeeId,
      department,
      phone 
    } = data;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Email, password, firstName, lastName, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        role,
        permissions: permissions || [],
        isActive: true,
        specialization,
        licenseNumber,
        employeeId,
        department,
        phone,
      },
    }) as any;

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    ) as string;

    // Remove sensitive data from user object
    const { hashedPassword: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}