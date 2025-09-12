import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/collections/[collection] - Get all documents from a collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    
    // Map frontend collection names to Prisma models
    const collectionMap: { [key: string]: any } = {
      // Plural forms
      'users': prisma.user,
      'patients': prisma.patient,
      'appointments': prisma.appointment,
      'treatments': prisma.treatment,
      'medical-records': prisma.medicalRecord,
      'medicalRecords': prisma.medicalRecord,
      'clinical-images': prisma.clinicalImage,
      'clinicalImages': prisma.clinicalImage,
      'tooth-image-links': prisma.toothImageLink,
      'toothImageLinks': prisma.toothImageLink,
      'invoices': prisma.invoice,
      'insurance-claims': prisma.insuranceClaim,
      'insuranceClaims': prisma.insuranceClaim,
      'insurance-providers': prisma.insuranceProvider,
      'insuranceProviders': prisma.insuranceProvider,
      'staff': prisma.staff,
      'inventory': prisma.inventoryItem,
      'inventory-items': prisma.inventoryItem,
      'inventoryItems': prisma.inventoryItem,
      'purchase-orders': prisma.purchaseOrder,
      'purchaseOrders': prisma.purchaseOrder,
      'suppliers': prisma.supplier,
      'medications': prisma.medication,
      'prescriptions': prisma.prescription,
      'messages': prisma.message,
      'referrals': prisma.referral,
      'specialists': prisma.specialist,
      'portal-users': prisma.portalUser,
      'portalUsers': prisma.portalUser,
      'shared-documents': prisma.sharedDocument,
      'sharedDocuments': prisma.sharedDocument,
      'transactions': prisma.transaction,
      'clinic-settings': prisma.clinicSettings,
      'clinicSettings': prisma.clinicSettings,
      
      // Singular forms (for backward compatibility)
      'user': prisma.user,
      'patient': prisma.patient,
      'appointment': prisma.appointment,
      'treatment': prisma.treatment,
      'medicalRecord': prisma.medicalRecord,
      'clinicalImage': prisma.clinicalImage,
      'toothImageLink': prisma.toothImageLink,
      'invoice': prisma.invoice,
      'insuranceClaim': prisma.insuranceClaim,
      'insuranceProvider': prisma.insuranceProvider,
      'inventoryItem': prisma.inventoryItem,
      'purchaseOrder': prisma.purchaseOrder,
      'supplier': prisma.supplier,
      'medication': prisma.medication,
      'prescription': prisma.prescription,
      'message': prisma.message,
      'referral': prisma.referral,
      'specialist': prisma.specialist,
      'portalUser': prisma.portalUser,
      'sharedDocument': prisma.sharedDocument,
      'transaction': prisma.transaction,
      'clinicSettings': prisma.clinicSettings
    };

    const model = collectionMap[collection];
    if (!model) {
      console.error(`Invalid collection name: ${collection}`);
      return NextResponse.json({ error: `Invalid collection: ${collection}` }, { status: 400 });
    }

    // Try to fetch data with createdAt ordering, fallback to no ordering if field doesn't exist
    try {
      const data = await model.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(data);
    } catch (orderError) {
      console.log(`CreatedAt field not found for ${collection}, fetching without ordering`);
      const data = await model.findMany();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error(`Error fetching collection ${collection}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/collections/[collection] - Add a new document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const data = await request.json();
    
    // Map frontend collection names to Prisma models (same mapping as GET)
    const collectionMap: { [key: string]: any } = {
      // Plural forms
      'users': prisma.user,
      'patients': prisma.patient,
      'appointments': prisma.appointment,
      'treatments': prisma.treatment,
      'medical-records': prisma.medicalRecord,
      'medicalRecords': prisma.medicalRecord,
      'clinical-images': prisma.clinicalImage,
      'clinicalImages': prisma.clinicalImage,
      'tooth-image-links': prisma.toothImageLink,
      'toothImageLinks': prisma.toothImageLink,
      'invoices': prisma.invoice,
      'insurance-claims': prisma.insuranceClaim,
      'insuranceClaims': prisma.insuranceClaim,
      'insurance-providers': prisma.insuranceProvider,
      'insuranceProviders': prisma.insuranceProvider,
      'staff': prisma.staff,
      'inventory': prisma.inventoryItem,
      'inventory-items': prisma.inventoryItem,
      'inventoryItems': prisma.inventoryItem,
      'purchase-orders': prisma.purchaseOrder,
      'purchaseOrders': prisma.purchaseOrder,
      'suppliers': prisma.supplier,
      'medications': prisma.medication,
      'prescriptions': prisma.prescription,
      'messages': prisma.message,
      'referrals': prisma.referral,
      'specialists': prisma.specialist,
      'portal-users': prisma.portalUser,
      'portalUsers': prisma.portalUser,
      'shared-documents': prisma.sharedDocument,
      'sharedDocuments': prisma.sharedDocument,
      'transactions': prisma.transaction,
      'clinic-settings': prisma.clinicSettings,
      'clinicSettings': prisma.clinicSettings,
      
      // Singular forms (for backward compatibility)
      'user': prisma.user,
      'patient': prisma.patient,
      'appointment': prisma.appointment,
      'treatment': prisma.treatment,
      'medicalRecord': prisma.medicalRecord,
      'clinicalImage': prisma.clinicalImage,
      'toothImageLink': prisma.toothImageLink,
      'invoice': prisma.invoice,
      'insuranceClaim': prisma.insuranceClaim,
      'insuranceProvider': prisma.insuranceProvider,
      'inventoryItem': prisma.inventoryItem,
      'purchaseOrder': prisma.purchaseOrder,
      'supplier': prisma.supplier,
      'medication': prisma.medication,
      'prescription': prisma.prescription,
      'message': prisma.message,
      'referral': prisma.referral,
      'specialist': prisma.specialist,
      'portalUser': prisma.portalUser,
      'sharedDocument': prisma.sharedDocument,
      'transaction': prisma.transaction,
      'clinicSettings': prisma.clinicSettings
    };

    const model = collectionMap[collection];
    if (!model) {
      console.error(`Invalid collection name: ${collection}`);
      return NextResponse.json({ error: `Invalid collection: ${collection}` }, { status: 400 });
    }

    const result = await model.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error creating document in collection ${collection}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}