import { prisma } from '@/lib/prisma';
import type { 
  Patient, 
  Appointment, 
  Treatment, 
  User, 
  Invoice,
  Staff,
  InventoryItem,
  MedicalRecord,
  ClinicalImage,
  ToothImageLink,
  InsuranceClaim,
  InsuranceProvider,
  PurchaseOrder,
  Supplier,
  Medication,
  Prescription,
  Message,
  Referral,
  Specialist,
  PortalUser,
  SharedDocument,
  Transaction,
  ClinicSettings,
  Prisma
} from '@prisma/client';

// Generic functions for CRUD operations

// GET COLLECTION - Fetch all records from a collection
export async function getCollection<T>(
  model: keyof typeof prisma,
  include?: any
): Promise<T[]> {
  try {
    const collection = prisma[model] as any;
    const data = await collection.findMany({
      include,
      orderBy: { createdAt: 'desc' }
    });
    return data as T[];
  } catch (error) {
    console.error(`Error fetching ${String(model)}:`, error);
    throw error;
  }
}

// GET DOCUMENT - Fetch a single record by ID
export async function getDocument<T>(
  model: keyof typeof prisma,
  id: string,
  include?: any
): Promise<T | null> {
  try {
    const collection = prisma[model] as any;
    const data = await collection.findUnique({
      where: { id },
      include
    });
    return data as T | null;
  } catch (error) {
    console.error(`Error fetching ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// ADD DOCUMENT - Create a new record
export async function addDocument<T>(
  model: keyof typeof prisma,
  data: any
): Promise<T> {
  try {
    const collection = prisma[model] as any;
    const result = await collection.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return result as T;
  } catch (error) {
    console.error(`Error adding ${String(model)}:`, error);
    throw error;
  }
}

// SET DOCUMENT - Create or update a record with specific ID
export async function setDocument<T>(
  model: keyof typeof prisma,
  id: string,
  data: any
): Promise<T> {
  try {
    const collection = prisma[model] as any;
    const result = await collection.upsert({
      where: { id },
      create: {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        ...data,
        updatedAt: new Date()
      }
    });
    return result as T;
  } catch (error) {
    console.error(`Error setting ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// UPDATE DOCUMENT - Update an existing record
export async function updateDocument<T>(
  model: keyof typeof prisma,
  id: string,
  data: any
): Promise<T> {
  try {
    const collection = prisma[model] as any;
    const result = await collection.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    return result as T;
  } catch (error) {
    console.error(`Error updating ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// DELETE DOCUMENT - Delete a record by ID
export async function deleteDocument(
  model: keyof typeof prisma,
  id: string
): Promise<void> {
  try {
    const collection = prisma[model] as any;
    await collection.delete({
      where: { id }
    });
  } catch (error) {
    console.error(`Error deleting ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// LISTEN TO COLLECTION - Real-time subscription (Note: PostgreSQL doesn't have native real-time like Firestore)
// This is a polling-based alternative - for true real-time, consider using Supabase or implementing WebSockets
export function listenToCollection<T>(
  model: keyof typeof prisma,
  callback: (data: T[]) => void,
  onError: (error: Error) => void,
  pollInterval: number = 5000 // Poll every 5 seconds by default
): () => void {
  let intervalId: NodeJS.Timeout;
  
  const poll = async () => {
    try {
      const data = await getCollection<T>(model);
      callback(data);
    } catch (error) {
      onError(error as Error);
    }
  };

  // Initial fetch
  poll();

  // Set up polling
  intervalId = setInterval(poll, pollInterval);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

// SEARCH FUNCTIONS

// Search patients
export async function searchPatients(searchTerm: string): Promise<Patient[]> {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    return patients;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
}

// Get appointments by date range
export async function getAppointmentsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        patient: true,
        doctor: true
      },
      orderBy: { dateTime: 'asc' }
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    throw error;
  }
}

// Get treatments for a patient
export async function getPatientTreatments(patientId: string): Promise<Treatment[]> {
  try {
    const treatments = await prisma.treatment.findMany({
      where: { patientId },
      include: {
        doctor: true,
        appointment: true
      },
      orderBy: { date: 'desc' }
    });
    return treatments;
  } catch (error) {
    console.error('Error fetching patient treatments:', error);
    throw error;
  }
}

// Get patient's medical records
export async function getPatientMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' }
    });
    return records;
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    throw error;
  }
}

// Get low stock inventory items
export async function getLowStockItems(): Promise<InventoryItem[]> {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minQuantity
        }
      },
      orderBy: { quantity: 'asc' }
    });
    return items;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
}

// Get overdue invoices
export async function getOverdueInvoices(): Promise<Invoice[]> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: 'paid' },
        dueDate: { lt: new Date() }
      },
      include: {
        patient: true
      },
      orderBy: { dueDate: 'asc' }
    });
    return invoices;
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    throw error;
  }
}

// Batch operations
export async function batchCreateDocuments<T>(
  model: keyof typeof prisma,
  data: any[]
): Promise<void> {
  try {
    const collection = prisma[model] as any;
    await collection.createMany({
      data: data.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    });
  } catch (error) {
    console.error(`Error batch creating ${String(model)}:`, error);
    throw error;
  }
}

// Transaction wrapper for complex operations
export async function executeTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(operations);
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw error;
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default prisma;