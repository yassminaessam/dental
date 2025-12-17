import { NextRequest, NextResponse } from 'next/server';
import { ReferralsService } from '@/services/referrals';
import type { ReferralStatus, ReferralUrgency } from '@prisma/client';

interface ReferralUpdatePayload {
  specialty?: string;
  specialist?: string;
  reason?: string;
  urgency?: ReferralUrgency;
  status?: ReferralStatus;
  referringDoctor?: string;
  referringDoctorId?: string;
  notes?: string;
  appointmentDate?: string | null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const referral = await ReferralsService.get(id);

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found.' }, { status: 404 });
    }

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

    return NextResponse.json({ referral: serialized });
  } catch (error) {
    console.error('[api/referrals/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load referral.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as ReferralUpdatePayload;

    // Check if referral exists
    const existing = await ReferralsService.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Referral not found.' }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};
    if (payload.specialty !== undefined) updateData.specialty = payload.specialty;
    if (payload.specialist !== undefined) updateData.specialist = payload.specialist;
    if (payload.reason !== undefined) updateData.reason = payload.reason;
    if (payload.urgency !== undefined) updateData.urgency = payload.urgency;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.referringDoctor !== undefined) updateData.referringDoctor = payload.referringDoctor;
    if (payload.referringDoctorId !== undefined) updateData.referringDoctorId = payload.referringDoctorId;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.appointmentDate !== undefined) {
      updateData.appointmentDate = payload.appointmentDate ? new Date(payload.appointmentDate) : null;
    }

    const referral = await ReferralsService.update(id, updateData);

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

    return NextResponse.json({ referral: serialized });
  } catch (error: any) {
    console.error('[api/referrals/[id]] PATCH error', error);
    return NextResponse.json({ 
      error: 'Failed to update referral.',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if referral exists
    const existing = await ReferralsService.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Referral not found.' }, { status: 404 });
    }

    await ReferralsService.delete(id);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[api/referrals/[id]] DELETE error', error);
    return NextResponse.json({ 
      error: 'Failed to delete referral.',
      details: error.message 
    }, { status: 500 });
  }
}
