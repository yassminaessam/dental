import { NextRequest, NextResponse } from 'next/server';
import { ReferralsService } from '@/services/referrals';
import { PatientsService } from '@/services/patients';
import type { ReferralUrgency } from '@prisma/client';

interface ReferralCreatePayload {
  patientId: string;
  specialty: string;
  specialist: string;
  reason: string;
  urgency: ReferralUrgency;
  referringDoctor?: string;
  referringDoctorId?: string;
  notes?: string;
  appointmentDate?: string;
}

export async function GET() {
  try {
    const referrals = await ReferralsService.list();

    // Serialize dates
    const serialized = referrals.map((r) => ({
      ...r,
      referralDate: r.referralDate.toISOString(),
      appointmentDate: r.appointmentDate?.toISOString() || null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      // Map to match frontend expected format
      patient: r.patientName,
      date: r.referralDate.toLocaleDateString(),
      apptDate: r.appointmentDate?.toLocaleDateString() || null,
    }));

    return NextResponse.json({ referrals: serialized });
  } catch (error) {
    console.error('[api/referrals] GET error', error);
    return NextResponse.json({ error: 'Failed to load referrals.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ReferralCreatePayload;

    if (!payload.patientId || !payload.specialty || !payload.specialist || !payload.reason || !payload.urgency) {
      return NextResponse.json({ error: 'Missing required referral fields.' }, { status: 400 });
    }

    // Get patient name from patient ID
    const patient = await PatientsService.get(payload.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    const patientName = `${patient.name} ${patient.lastName}`.trim();

    const referral = await ReferralsService.create({
      patientId: payload.patientId,
      patientName,
      specialty: payload.specialty,
      specialist: payload.specialist,
      reason: payload.reason,
      urgency: payload.urgency,
      referringDoctor: payload.referringDoctor,
      referringDoctorId: payload.referringDoctorId,
      notes: payload.notes,
      appointmentDate: payload.appointmentDate ? new Date(payload.appointmentDate) : undefined,
    });

    // Serialize dates
    const serialized = {
      ...referral,
      referralDate: referral.referralDate.toISOString(),
      appointmentDate: referral.appointmentDate?.toISOString() || null,
      createdAt: referral.createdAt.toISOString(),
      updatedAt: referral.updatedAt.toISOString(),
      // Map to match frontend expected format
      patient: referral.patientName,
      date: referral.referralDate.toLocaleDateString(),
      apptDate: referral.appointmentDate?.toLocaleDateString() || null,
    };

    return NextResponse.json({ referral: serialized }, { status: 201 });
  } catch (error: any) {
    console.error('[api/referrals] POST error', error);
    return NextResponse.json({ 
      error: 'Failed to create referral.',
      details: error.message 
    }, { status: 500 });
  }
}
