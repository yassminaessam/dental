import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/services/database';

// GET /api/documents/[collection]/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    
    const dbClient = await getDbClient();
    const validCollections: { [key: string]: any } = {
      'user': dbClient.user,
      'patient': dbClient.patient,
      'appointment': dbClient.appointment,
      'treatment': dbClient.treatment,
      'medicalRecord': dbClient.medicalRecord,
      'clinicalImage': dbClient.clinicalImage,
      'toothImageLink': dbClient.toothImageLink,
      'invoice': dbClient.invoice,
      'insuranceClaim': dbClient.insuranceClaim,
      'insuranceProvider': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventoryItem': dbClient.inventoryItem,
      'purchaseOrder': dbClient.purchaseOrder,
      'supplier': dbClient.supplier,
      'medication': dbClient.medication,
      'prescription': dbClient.prescription,
      'message': dbClient.message,
      'referral': dbClient.referral,
      'specialist': dbClient.specialist,
      'portalUser': dbClient.portalUser,
      'sharedDocument': dbClient.sharedDocument,
      'transaction': dbClient.transaction,
      'clinicSettings': dbClient.clinicSettings
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const data = await model.findUnique({
      where: { id }
    });

    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const data = await request.json();
    
    const dbClient = await getDbClient();
    const validCollections: { [key: string]: any } = {
      'user': dbClient.user,
      'patient': dbClient.patient,
      'appointment': dbClient.appointment,
      'treatment': dbClient.treatment,
      'medicalRecord': dbClient.medicalRecord,
      'clinicalImage': dbClient.clinicalImage,
      'toothImageLink': dbClient.toothImageLink,
      'invoice': dbClient.invoice,
      'insuranceClaim': dbClient.insuranceClaim,
      'insuranceProvider': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventoryItem': dbClient.inventoryItem,
      'purchaseOrder': dbClient.purchaseOrder,
      'supplier': dbClient.supplier,
      'medication': dbClient.medication,
      'prescription': dbClient.prescription,
      'message': dbClient.message,
      'referral': dbClient.referral,
      'specialist': dbClient.specialist,
      'portalUser': dbClient.portalUser,
      'sharedDocument': dbClient.sharedDocument,
      'transaction': dbClient.transaction,
      'clinicSettings': dbClient.clinicSettings
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const result = await model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating document:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/documents/[collection]/[id] - Set/upsert a specific document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const data = await request.json();
    
    const dbClient = await getDbClient();
    const validCollections: { [key: string]: any } = {
      'user': dbClient.user,
      'patient': dbClient.patient,
      'appointment': dbClient.appointment,
      'treatment': dbClient.treatment,
      'medicalRecord': dbClient.medicalRecord,
      'clinicalImage': dbClient.clinicalImage,
      'toothImageLink': dbClient.toothImageLink,
      'invoice': dbClient.invoice,
      'insuranceClaim': dbClient.insuranceClaim,
      'insuranceProvider': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventoryItem': dbClient.inventoryItem,
      'purchaseOrder': dbClient.purchaseOrder,
      'supplier': dbClient.supplier,
      'medication': dbClient.medication,
      'prescription': dbClient.prescription,
      'message': dbClient.message,
      'referral': dbClient.referral,
      'specialist': dbClient.specialist,
      'portalUser': dbClient.portalUser,
      'sharedDocument': dbClient.sharedDocument,
      'transaction': dbClient.transaction,
      'clinicSettings': dbClient.clinicSettings
    };

    const model = validCollections[collection];
    if (!model) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const result = await model.upsert({
      where: { id },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error setting document:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[collection]/[id] - Delete a specific document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    
    const dbClient = await getDbClient();
    const validCollections: { [key: string]: any } = {
      'user': dbClient.user,
      'patient': dbClient.patient,
      'appointment': dbClient.appointment,
      'treatment': dbClient.treatment,
      'medicalRecord': dbClient.medicalRecord,
      'clinicalImage': dbClient.clinicalImage,
      'toothImageLink': dbClient.toothImageLink,
      'invoice': dbClient.invoice,
      'insuranceClaim': dbClient.insuranceClaim,
      'insuranceProvider': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventoryItem': dbClient.inventoryItem,
      'purchaseOrder': dbClient.purchaseOrder,
      'supplier': dbClient.supplier,
      'medication': dbClient.medication,
      'prescription': dbClient.prescription,
      'message': dbClient.message,
      'referral': dbClient.referral,
      'specialist': dbClient.specialist,
      'portalUser': dbClient.portalUser,
      'sharedDocument': dbClient.sharedDocument,
      'transaction': dbClient.transaction,
      'clinicSettings': dbClient.clinicSettings
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