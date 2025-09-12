import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/services/database';

// GET /api/collections/[collection] - Get all documents from a collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const dbClient = await getDbClient();
    
    // Map frontend collection names to Prisma models
    const collectionMap: { [key: string]: any } = {
      // Plural forms
      'users': dbClient.user,
      'patients': dbClient.patient,
      'appointments': dbClient.appointment,
      'treatments': dbClient.treatment,
      'medical-records': dbClient.medicalRecord,
      'medicalRecords': dbClient.medicalRecord,
      'clinical-images': dbClient.clinicalImage,
      'clinicalImages': dbClient.clinicalImage,
      'tooth-image-links': dbClient.toothImageLink,
      'toothImageLinks': dbClient.toothImageLink,
      'invoices': dbClient.invoice,
      'insurance-claims': dbClient.insuranceClaim,
      'insuranceClaims': dbClient.insuranceClaim,
      'insurance-providers': dbClient.insuranceProvider,
      'insuranceProviders': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventory': dbClient.inventoryItem,
      'inventory-items': dbClient.inventoryItem,
      'inventoryItems': dbClient.inventoryItem,
      'purchase-orders': dbClient.purchaseOrder,
      'purchaseOrders': dbClient.purchaseOrder,
      'suppliers': dbClient.supplier,
      'medications': dbClient.medication,
      'prescriptions': dbClient.prescription,
      'messages': dbClient.message,
      'referrals': dbClient.referral,
      'specialists': dbClient.specialist,
      'portal-users': dbClient.portalUser,
      'portalUsers': dbClient.portalUser,
      'shared-documents': dbClient.sharedDocument,
      'sharedDocuments': dbClient.sharedDocument,
      'transactions': dbClient.transaction,
      'clinic-settings': dbClient.clinicSettings,
      'clinicSettings': dbClient.clinicSettings,
      
      // Singular forms (for backward compatibility)
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
      'transaction': dbClient.transaction
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
    const { collection } = await params;
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
    const dbClient = await getDbClient();
    
    // Map frontend collection names to Prisma models (same mapping as GET)
    const collectionMap: { [key: string]: any } = {
      // Plural forms
      'users': dbClient.user,
      'patients': dbClient.patient,
      'appointments': dbClient.appointment,
      'treatments': dbClient.treatment,
      'medical-records': dbClient.medicalRecord,
      'medicalRecords': dbClient.medicalRecord,
      'clinical-images': dbClient.clinicalImage,
      'clinicalImages': dbClient.clinicalImage,
      'tooth-image-links': dbClient.toothImageLink,
      'toothImageLinks': dbClient.toothImageLink,
      'invoices': dbClient.invoice,
      'insurance-claims': dbClient.insuranceClaim,
      'insuranceClaims': dbClient.insuranceClaim,
      'insurance-providers': dbClient.insuranceProvider,
      'insuranceProviders': dbClient.insuranceProvider,
      'staff': dbClient.staff,
      'inventory': dbClient.inventoryItem,
      'inventory-items': dbClient.inventoryItem,
      'inventoryItems': dbClient.inventoryItem,
      'purchase-orders': dbClient.purchaseOrder,
      'purchaseOrders': dbClient.purchaseOrder,
      'suppliers': dbClient.supplier,
      'medications': dbClient.medication,
      'prescriptions': dbClient.prescription,
      'messages': dbClient.message,
      'referrals': dbClient.referral,
      'specialists': dbClient.specialist,
      'portal-users': dbClient.portalUser,
      'portalUsers': dbClient.portalUser,
      'shared-documents': dbClient.sharedDocument,
      'sharedDocuments': dbClient.sharedDocument,
      'transactions': dbClient.transaction,
      'clinic-settings': dbClient.clinicSettings,
      'clinicSettings': dbClient.clinicSettings,
      
      // Singular forms (for backward compatibility)
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
      'transaction': dbClient.transaction
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
    const { collection } = await params;
    console.error(`Error creating document in collection ${collection}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
