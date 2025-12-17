import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get patient by email
    const patient = await prisma.patient.findUnique({
      where: { email },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get referrals for this patient from Neon database
    const referrals = await prisma.referral.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        referralDate: 'desc',
      },
    });

    // Get status history for each referral
    const referralsWithHistory = await Promise.all(
      referrals.map(async (referral) => {
        const statusHistory = await prisma.referralStatusLog.findMany({
          where: { referralId: referral.id },
          orderBy: { changedAt: 'desc' },
        }).catch(() => []); // Return empty array if table doesn't exist yet

        return {
          id: referral.id,
          specialty: referral.specialty,
          specialist: referral.specialist,
          reason: referral.reason,
          urgency: referral.urgency,
          status: referral.status,
          referralDate: referral.referralDate,
          appointmentDate: referral.appointmentDate,
          referringDoctor: referral.referringDoctor,
          notes: referral.notes,
          statusHistory: statusHistory.map((log: any) => ({
            id: log.id,
            fromStatus: log.fromStatus,
            toStatus: log.toStatus,
            changedBy: log.changedByName || log.changedBy,
            changedAt: log.changedAt,
            notes: log.notes,
          })),
        };
      })
    );

    return NextResponse.json({
      referrals: referralsWithHistory,
      patient: {
        id: patient.id,
        name: patient.name,
        lastName: patient.lastName,
      },
    });
  } catch (error) {
    console.error('Error fetching patient referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
