import { prisma } from '../src/lib/prisma';

type InventoryStatus = 'Normal' | 'LowStock' | 'OutOfStock';
type MedicationStatus = 'InStock' | 'LowStock' | 'OutOfStock';

const parseCurrency = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length) {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const parseDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' && value.trim().length) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const mapInventoryStatus = (status: unknown): InventoryStatus => {
  if (typeof status !== 'string') return 'Normal';
  const normalized = status.toLowerCase();
  if (normalized.includes('out')) return 'OutOfStock';
  if (normalized.includes('low')) return 'LowStock';
  return 'Normal';
};

const mapMedicationStatus = (status: unknown): MedicationStatus => {
  if (typeof status !== 'string') return 'InStock';
  const normalized = status.toLowerCase();
  if (normalized.includes('out')) return 'OutOfStock';
  if (normalized.includes('low')) return 'LowStock';
  return 'InStock';
};

async function backfillSuppliers() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'suppliers' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.supplier.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        name: data.name ?? doc.id,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        category: data.category ?? null,
        paymentTerms: data.paymentTerms ?? null,
        rating: data.rating != null ? Number(data.rating) : null,
        status: (data.status === 'Inactive' ? 'Inactive' : 'Active'),
      },
      update: {
        name: data.name ?? doc.id,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        category: data.category ?? null,
        paymentTerms: data.paymentTerms ?? null,
        rating: data.rating != null ? Number(data.rating) : null,
        status: (data.status === 'Inactive' ? 'Inactive' : 'Active'),
      },
    });
  }
  console.log(`Backfilled ${docs.length} suppliers`);
}

async function backfillInventory() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'inventory' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.inventoryItem.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        name: data.name ?? data.itemName ?? doc.id,
        category: data.category ?? null,
        supplierId: data.supplierId ?? null,
        supplierName: data.supplier ?? data.supplierName ?? null,
        quantity: data.quantity ?? data.stock ?? 0,
        minQuantity: data.minQuantity ?? data.min ?? 0,
        maxQuantity: data.maxQuantity ?? data.max ?? 0,
        unitCost: parseCurrency(data.unitCost ?? data.cost),
        status: mapInventoryStatus(data.status),
        expires: parseDate(data.expires ?? data.expiryDate),
        location: data.location ?? null,
      },
      update: {
        name: data.name ?? data.itemName ?? doc.id,
        category: data.category ?? null,
        supplierId: data.supplierId ?? null,
        supplierName: data.supplier ?? data.supplierName ?? null,
        quantity: data.quantity ?? data.stock ?? 0,
        minQuantity: data.minQuantity ?? data.min ?? 0,
        maxQuantity: data.maxQuantity ?? data.max ?? 0,
        unitCost: parseCurrency(data.unitCost ?? data.cost),
        status: mapInventoryStatus(data.status),
        expires: parseDate(data.expires ?? data.expiryDate),
        location: data.location ?? null,
      },
    });
  }
  console.log(`Backfilled ${docs.length} inventory items`);
}

async function backfillPurchaseOrders() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'purchase-orders' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.purchaseOrder.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        supplierId: data.supplierId ?? null,
        supplierName: data.supplier ?? data.supplierName ?? 'Unknown Supplier',
        status: ['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(data.status)
          ? data.status
          : 'Pending',
        total: parseCurrency(data.total ?? data.totalAmount),
        orderDate: parseDate(data.orderDate) ?? new Date(),
        expectedDelivery: parseDate(data.deliveryDate ?? data.expectedDelivery),
        items: Array.isArray(data.items) ? data.items : [],
      },
      update: {
        supplierId: data.supplierId ?? null,
        supplierName: data.supplier ?? data.supplierName ?? 'Unknown Supplier',
        status: ['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(data.status)
          ? data.status
          : 'Pending',
        total: parseCurrency(data.total ?? data.totalAmount),
        orderDate: parseDate(data.orderDate) ?? new Date(),
        expectedDelivery: parseDate(data.deliveryDate ?? data.expectedDelivery),
        items: Array.isArray(data.items) ? data.items : [],
      },
    });
  }
  console.log(`Backfilled ${docs.length} purchase orders`);
}

async function backfillMedications() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'medications' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.medication.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        name: data.name ?? doc.id,
        fullName: data.fullName ?? data.name ?? null,
        strength: data.strength ?? null,
        form: data.form ?? null,
        category: data.category ?? null,
        stock: data.stock ?? data.quantity ?? 0,
        unitPrice: parseCurrency(data.unitPrice ?? data.price),
        expiryDate: parseDate(data.expiryDate ?? data.expires),
        status: mapMedicationStatus(data.status),
        inventoryItemId: data.inventoryItemId ?? null,
      },
      update: {
        name: data.name ?? doc.id,
        fullName: data.fullName ?? data.name ?? null,
        strength: data.strength ?? null,
        form: data.form ?? null,
        category: data.category ?? null,
        stock: data.stock ?? data.quantity ?? 0,
        unitPrice: parseCurrency(data.unitPrice ?? data.price),
        expiryDate: parseDate(data.expiryDate ?? data.expires),
        status: mapMedicationStatus(data.status),
        inventoryItemId: data.inventoryItemId ?? null,
      },
    });
  }
  console.log(`Backfilled ${docs.length} medications`);
}

async function backfillPrescriptions() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'prescriptions' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.prescription.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        patientId: data.patientId ?? null,
        patientName: data.patient ?? data.patientName ?? 'Unknown Patient',
        doctorId: data.doctorId ?? null,
        doctorName: data.doctor ?? data.doctorName ?? 'Unknown Doctor',
        medicationId: data.medicationId ?? null,
        medicationName: data.medication ?? data.medicationName ?? 'Medication',
        strength: data.strength ?? null,
        dosage: data.dosage ?? null,
        instructions: data.instructions ?? null,
        duration: data.duration ?? null,
        refills: data.refills ?? 0,
        status: data.status === 'Completed' ? 'Completed' : 'Active',
        invoiceId: data.invoiceId ?? null,
        treatmentId: data.treatmentId ?? null,
        dispensedAt: parseDate(data.dispensedAt),
        dispensedQuantity: data.dispensedQuantity ?? null,
        totalAmount: data.totalAmount != null ? parseCurrency(data.totalAmount) : null,
      },
      update: {
        patientId: data.patientId ?? null,
        patientName: data.patient ?? data.patientName ?? 'Unknown Patient',
        doctorId: data.doctorId ?? null,
        doctorName: data.doctor ?? data.doctorName ?? 'Unknown Doctor',
        medicationId: data.medicationId ?? null,
        medicationName: data.medication ?? data.medicationName ?? 'Medication',
        strength: data.strength ?? null,
        dosage: data.dosage ?? null,
        instructions: data.instructions ?? null,
        duration: data.duration ?? null,
        refills: data.refills ?? 0,
        status: data.status === 'Completed' ? 'Completed' : 'Active',
        invoiceId: data.invoiceId ?? null,
        treatmentId: data.treatmentId ?? null,
        dispensedAt: parseDate(data.dispensedAt),
        dispensedQuantity: data.dispensedQuantity ?? null,
        totalAmount: data.totalAmount != null ? parseCurrency(data.totalAmount) : null,
      },
    });
  }
  console.log(`Backfilled ${docs.length} prescriptions`);
}

async function backfillDispenses() {
  const docs = await prisma.collectionDoc.findMany({ where: { collection: 'pharmacy-dispensing' } });
  for (const doc of docs) {
    const data = (doc.data as Record<string, any>) ?? {};
    await prisma.pharmacyDispense.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        prescriptionId: data.prescriptionId ?? null,
        medicationId: data.medicationId ?? null,
        patientId: data.patientId ?? null,
        patientName: data.patient ?? data.patientName ?? 'Unknown Patient',
        doctorId: data.doctorId ?? null,
        doctorName: data.doctor ?? data.doctorName ?? null,
        quantity: data.quantity ?? 0,
        unitPrice: parseCurrency(data.unitPrice),
        totalAmount: parseCurrency(data.total ?? data.totalAmount),
        invoiceId: data.invoiceId ?? null,
        treatmentId: data.treatmentId ?? null,
        notes: data.notes ?? null,
        dispensedBy: data.dispensedBy ?? null,
        dispensedAt: parseDate(data.dispensedAt) ?? new Date(),
      },
      update: {
        prescriptionId: data.prescriptionId ?? null,
        medicationId: data.medicationId ?? null,
        patientId: data.patientId ?? null,
        patientName: data.patient ?? data.patientName ?? 'Unknown Patient',
        doctorId: data.doctorId ?? null,
        doctorName: data.doctor ?? data.doctorName ?? null,
        quantity: data.quantity ?? 0,
        unitPrice: parseCurrency(data.unitPrice),
        totalAmount: parseCurrency(data.total ?? data.totalAmount),
        invoiceId: data.invoiceId ?? null,
        treatmentId: data.treatmentId ?? null,
        notes: data.notes ?? null,
        dispensedBy: data.dispensedBy ?? null,
        dispensedAt: parseDate(data.dispensedAt) ?? new Date(),
      },
    });
  }
  console.log(`Backfilled ${docs.length} pharmacy dispense records`);
}

async function main() {
  await backfillSuppliers();
  await backfillInventory();
  await backfillPurchaseOrders();
  await backfillMedications();
  await backfillPrescriptions();
  await backfillDispenses();
}

main()
  .then(() => {
    console.log('Supply chain and pharmacy backfill complete.');
  })
  .catch((err) => {
    console.error('Backfill failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
