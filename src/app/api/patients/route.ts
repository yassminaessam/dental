import { NextRequest, NextResponse } from 'next/server';
import { createDocument, generateDocumentId } from '@/services/datastore.server';

interface PatientCreatePayload {
  id?: string;
  name: string;
  lastName: string;
  email?: string;
  phone: string;
  dob: string;
  age: number;
  lastVisit: string;
  status: string;
  address?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelationship?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: Array<{ condition: string; notes?: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as PatientCreatePayload;

    if (!payload.name || !payload.lastName || !payload.phone || !payload.dob) {
      return NextResponse.json({ error: 'Missing required patient fields.' }, { status: 400 });
    }

    const id = payload.id ?? generateDocumentId('PAT');
    const record = {
      ...payload,
      id,
      dob: new Date(payload.dob).toISOString(),
    };

    await createDocument('patients', record);

    return NextResponse.json({ patient: record }, { status: 201 });
  } catch (error) {
    console.error('[api/patients] POST error', error);
    return NextResponse.json({ error: 'Failed to create patient.' }, { status: 500 });
  }
}
