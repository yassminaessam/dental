import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/services/database';

// GET /api/documents/[collection]/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await context.params;
    
    const dbClient = await getDbClient();
    const dbc: any = dbClient as any;
    const validCollections: { [key: string]: any } = {
      'user': dbc['user'],
      'patient': dbc['patient'],
      'appointment': dbc['appointment'],
      'treatment': dbc['treatment'],
      'medicalRecord': dbc['medicalRecord'],
      'clinicalImage': dbc['clinicalImage'],
      'toothImageLink': dbc['toothImageLink'],
      'invoice': dbc['invoice'],
      'insuranceClaim': dbc['insuranceClaim'],
      'insuranceProvider': dbc['insuranceProvider'],
      'staff': dbc['staff'],
      'inventoryItem': dbc['inventoryItem'],
      'purchaseOrder': dbc['purchaseOrder'],
      'supplier': dbc['supplier'],
      'medication': dbc['medication'],
      'prescription': dbc['prescription'],
      'message': dbc['message'],
      'referral': dbc['referral'],
      'specialist': dbc['specialist'],
      'portalUser': dbc['portalUser'],
      'sharedDocument': dbc['sharedDocument'],
      'transaction': dbc['transaction'],
      'clinicSettings': dbc['clinicSettings'],
      // Added hyphenated alias for settings (matches collection route & client usage)
      'clinic-settings': dbc['clinicSettings']
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    let data = await model.findUnique({ where: { id } });

    // Auto-initialize clinic settings if not found and collection is clinic-settings
    if (!data && (collection === 'clinic-settings' || collection === 'clinicSettings')) {
      const defaultSettings = {
        id,
        clinicName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        businessHours: 'mon-fri-8-6',
        timezone: 'UTC',
        appointmentDuration: 60,
        bookingLimit: 90,
        allowOnlineBooking: true,
        currency: 'USD',
        language: 'en',
        theme: 'light',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      try {
        data = await model.create({ data: defaultSettings });
      } catch (createErr) {
        console.error('Failed to auto-create clinic settings document:', createErr);
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Transform response for clinic-settings to include phoneNumber alias for client form
    if (collection === 'clinic-settings' || collection === 'clinicSettings') {
      const shaped = { ...data, phoneNumber: data.phone };
      return NextResponse.json(shaped);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching document:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/documents/[collection]/[id] - Update a specific document
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await context.params;
    const data = await request.json();
    
    const dbClient = await getDbClient();
    const dbc: any = dbClient as any;
    const validCollections: { [key: string]: any } = {
      'user': dbc['user'],
      'patient': dbc['patient'],
      'appointment': dbc['appointment'],
      'treatment': dbc['treatment'],
      'medicalRecord': dbc['medicalRecord'],
      'clinicalImage': dbc['clinicalImage'],
      'toothImageLink': dbc['toothImageLink'],
      'invoice': dbc['invoice'],
      'insuranceClaim': dbc['insuranceClaim'],
      'insuranceProvider': dbc['insuranceProvider'],
      'staff': dbc['staff'],
      'inventoryItem': dbc['inventoryItem'],
      'purchaseOrder': dbc['purchaseOrder'],
      'supplier': dbc['supplier'],
      'medication': dbc['medication'],
      'prescription': dbc['prescription'],
      'message': dbc['message'],
      'referral': dbc['referral'],
      'specialist': dbc['specialist'],
      'portalUser': dbc['portalUser'],
      'sharedDocument': dbc['sharedDocument'],
      'transaction': dbc['transaction'],
      'clinicSettings': dbc['clinicSettings'],
      'clinic-settings': dbc['clinicSettings']
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    // Normalization similar to PATCH for clinic settings
    const normalized = { ...data };
    if (collection === 'clinic-settings' || collection === 'clinicSettings') {
      if (normalized.phoneNumber && !normalized.phone) {
        normalized.phone = normalized.phoneNumber;
        delete normalized.phoneNumber;
      }
      const intFields: Array<keyof typeof normalized> = ['appointmentDuration','bookingLimit'];
      for (const f of intFields) {
        if (normalized[f] !== undefined && typeof normalized[f] === 'string') {
          const parsed = parseInt(normalized[f] as string, 10);
          if (!isNaN(parsed)) (normalized as any)[f] = parsed;
        }
      }
      if (normalized.allowOnlineBooking === undefined) {
        normalized.allowOnlineBooking = true;
      }
    }
    // Never allow id overwrite in update payload
    delete (normalized as any).id;

    const result = await model.update({
      where: { id },
      data: {
        ...normalized,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating document:`, error);
    const errObj: any = error;
    if (errObj?.code && errObj?.meta) {
      return NextResponse.json({ error: 'Validation failed', code: errObj.code, meta: errObj.meta }, { status: 422 });
    }
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Internal server error', message: errObj?.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/documents/[collection]/[id] - Set/upsert a specific document
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await context.params;
    const data = await request.json();
    
    const dbClient = await getDbClient();
    const dbc: any = dbClient as any;
    const validCollections: { [key: string]: any } = {
      'user': dbc['user'],
      'patient': dbc['patient'],
      'appointment': dbc['appointment'],
      'treatment': dbc['treatment'],
      'medicalRecord': dbc['medicalRecord'],
      'clinicalImage': dbc['clinicalImage'],
      'toothImageLink': dbc['toothImageLink'],
      'invoice': dbc['invoice'],
      'insuranceClaim': dbc['insuranceClaim'],
      'insuranceProvider': dbc['insuranceProvider'],
      'staff': dbc['staff'],
      'inventoryItem': dbc['inventoryItem'],
      'purchaseOrder': dbc['purchaseOrder'],
      'supplier': dbc['supplier'],
      'medication': dbc['medication'],
      'prescription': dbc['prescription'],
      'message': dbc['message'],
      'referral': dbc['referral'],
      'specialist': dbc['specialist'],
      'portalUser': dbc['portalUser'],
      'sharedDocument': dbc['sharedDocument'],
      'transaction': dbc['transaction'],
      'clinicSettings': dbc['clinicSettings'],
      'clinic-settings': dbc['clinicSettings']
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    // Special normalization for clinic settings (client form uses different keys / types)
    const normalized = { ...data };
    if (collection === 'clinic-settings' || collection === 'clinicSettings') {
      // Map phoneNumber -> phone (schema uses phone)
      if (normalized.phoneNumber && !normalized.phone) {
        normalized.phone = normalized.phoneNumber;
        delete normalized.phoneNumber;
      }
      // Coerce numeric string fields if present
      const intFields: Array<keyof typeof normalized> = ['appointmentDuration','bookingLimit'];
      for (const f of intFields) {
        if (normalized[f] !== undefined && typeof normalized[f] === 'string') {
          const parsed = parseInt(normalized[f] as string, 10);
            if (!isNaN(parsed)) {
              (normalized as any)[f] = parsed;
            }
        }
      }
      // Ensure allowOnlineBooking defaults if absent
      if (normalized.allowOnlineBooking === undefined) {
        normalized.allowOnlineBooking = true;
      }
    }

    // Prevent id mutation in update part
    const updateData = { ...normalized } as any;
    delete updateData.id;
    const createData = { id, ...normalized } as any;
    const result = await model.upsert({
      where: { id },
      update: {
        ...updateData,
        updatedAt: new Date()
      },
      create: {
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    // Provide better prisma error surface for debugging
    console.error(`Error setting document:`, error);
    const errObj: any = error;
    if (errObj?.code && errObj?.meta) {
      return NextResponse.json({ error: 'Validation failed', code: errObj.code, meta: errObj.meta }, { status: 422 });
    }
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Internal server error', message: errObj?.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[collection]/[id] - Delete a specific document
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await context.params;
    
    const dbClient = await getDbClient();
    const dbc: any = dbClient as any;
    const validCollections: { [key: string]: any } = {
      'user': dbc['user'],
      'patient': dbc['patient'],
      'appointment': dbc['appointment'],
      'treatment': dbc['treatment'],
      'medicalRecord': dbc['medicalRecord'],
      'clinicalImage': dbc['clinicalImage'],
      'toothImageLink': dbc['toothImageLink'],
      'invoice': dbc['invoice'],
      'insuranceClaim': dbc['insuranceClaim'],
      'insuranceProvider': dbc['insuranceProvider'],
      'staff': dbc['staff'],
      'inventoryItem': dbc['inventoryItem'],
      'purchaseOrder': dbc['purchaseOrder'],
      'supplier': dbc['supplier'],
      'medication': dbc['medication'],
      'prescription': dbc['prescription'],
      'message': dbc['message'],
      'referral': dbc['referral'],
      'specialist': dbc['specialist'],
      'portalUser': dbc['portalUser'],
      'sharedDocument': dbc['sharedDocument'],
      'transaction': dbc['transaction'],
      'clinicSettings': dbc['clinicSettings'],
      'clinic-settings': dbc['clinicSettings']
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    await model.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting document:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}