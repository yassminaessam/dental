import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';

// GET - Get patient's family members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await PatientsService.getWithFamily(id);
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    return NextResponse.json({ familyMembers: patient.familyMembers || [] });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
  }
}

// POST - Add family member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { relativeId, relationship, isPrimaryContact, notes } = body;
    
    if (!relativeId || !relationship) {
      return NextResponse.json({ error: 'relativeId and relationship are required' }, { status: 400 });
    }
    
    // Can't add yourself as a family member
    if (id === relativeId) {
      return NextResponse.json({ error: 'Cannot add self as family member' }, { status: 400 });
    }
    
    const familyMember = await PatientsService.addFamilyMember(
      id,
      relativeId,
      relationship,
      isPrimaryContact || false,
      notes
    );
    
    return NextResponse.json({ familyMember });
  } catch (error: any) {
    console.error('Error adding family member:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This family relationship already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}

// DELETE - Remove family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    
    if (!familyId) {
      return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
    }
    
    await PatientsService.removeFamilyMember(familyId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing family member:', error);
    return NextResponse.json({ error: 'Failed to remove family member' }, { status: 500 });
  }
}

// PATCH - Update family member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { familyId, relationship, isPrimaryContact, notes } = body;
    
    if (!familyId) {
      return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
    }
    
    await PatientsService.updateFamilyMember(familyId, {
      relationship,
      isPrimaryContact,
      notes,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 });
  }
}
