import { NextRequest, NextResponse } from 'next/server';
import { ReferralsService } from '@/services/referrals';
import prisma from '@/lib/db';
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
  changedBy?: string;
  changedByName?: string;
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

    // Track if status is changing for logging
    const isStatusChanging = payload.status !== undefined && payload.status !== existing.status;
    const previousStatus = existing.status;

    // Build update object (exclude logging fields)
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

    // Log status change if status was updated
    if (isStatusChanging && payload.changedBy && payload.changedByName) {
      try {
        await prisma.referralStatusLog.create({
          data: {
            referralId: id,
            fromStatus: previousStatus,
            toStatus: payload.status!,
            changedBy: payload.changedBy,
            changedByName: payload.changedByName,
            notes: payload.notes,
          },
        });
      } catch (logError) {
        // Log error but don't fail the update
        console.warn('[api/referrals/[id]] Failed to create status log:', logError);
      }
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
