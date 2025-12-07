import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import { PatientsService } from '@/services/patients';
import prisma from '@/lib/db';

/**
 * GET /api/debug/patient-user-link?userId=xxx
 * Debug endpoint to check patient-user link status
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const patientId = request.nextUrl.searchParams.get('patientId');
    const email = request.nextUrl.searchParams.get('email');

    const result: any = {
      query: { userId, patientId, email },
      user: null,
      patient: null,
      linkStatus: 'not_found',
    };

    // Check by userId
    if (userId) {
      const user = await UsersService.getById(userId);
      if (user) {
        result.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          patientId: user.patientId,
        };

        // If user has patientId, get that patient
        if (user.patientId) {
          const patient = await PatientsService.get(user.patientId);
          if (patient) {
            result.patient = {
              id: patient.id,
              name: patient.name,
              email: patient.email,
              status: patient.status,
            };
            result.linkStatus = 'linked_by_patientId';
          }
        } else {
          // Try to find patient by email
          const patientByEmail = await prisma.patient.findUnique({ where: { email: user.email } });
          if (patientByEmail) {
            result.patient = {
              id: patientByEmail.id,
              name: patientByEmail.name,
              email: patientByEmail.email,
              status: patientByEmail.status,
            };
            result.linkStatus = 'can_link_by_email';
          }
        }
      }
    }

    // Check by patientId
    if (patientId) {
      const patient = await PatientsService.get(patientId);
      if (patient) {
        result.patient = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          status: patient.status,
        };

        // Find user by patientId link
        const userByPatientId = await UsersService.getByPatientId(patientId);
        if (userByPatientId) {
          result.user = {
            id: userByPatientId.id,
            email: userByPatientId.email,
            role: userByPatientId.role,
            isActive: userByPatientId.isActive,
            patientId: userByPatientId.patientId,
          };
          result.linkStatus = 'linked_by_patientId';
        } else {
          // Try to find user by email
          const userByEmail = await UsersService.getByEmail(patient.email);
          if (userByEmail) {
            result.user = {
              id: userByEmail.id,
              email: userByEmail.email,
              role: userByEmail.role,
              isActive: userByEmail.isActive,
              patientId: userByEmail.patientId,
            };
            result.linkStatus = 'can_link_by_email';
          }
        }
      }
    }

    // Check by email
    if (email && !result.user && !result.patient) {
      const user = await UsersService.getByEmail(email);
      const patient = await prisma.patient.findUnique({ where: { email } });

      if (user) {
        result.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          patientId: user.patientId,
        };
      }

      if (patient) {
        result.patient = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          status: patient.status,
        };
      }

      if (user && patient) {
        result.linkStatus = user.patientId === patient.id ? 'linked_by_patientId' : 'can_link_by_email';
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[api/debug/patient-user-link] Error:', error);
    return NextResponse.json({ error: 'Debug check failed' }, { status: 500 });
  }
}
