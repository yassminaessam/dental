// Check if we're running in the browser
import { PrismaClient } from '@prisma/client';

// Function to check if we're     } else {
      // Server-side: use Prisma directly
      if (!dbClient) {
        throw new Error('Database client not initialized');
      }
      const collection = dbClient[model] as any;
      const result = await collection.delete({rowser environment
const isBrowser = () => typeof window !== 'undefined';

// Only import Prisma on the server side
let dbClient: any = null;
if (!isBrowser()) {
  dbClient = require('@/lib/prisma').prisma;
}

// Export function to get database client
export const getDbClient = () => dbClient;

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
  ClinicSettings
} from '@prisma/client';

// Generic functions for CRUD operations

// GET COLLECTION - Fetch all records from a collection
export async function getCollection<T>(
  model: string,
  include?: any
): Promise<T[]> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/collections/${model}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // Server-side: use Prisma directly
      const collection = dbClient[model] as any;
      const data = await collection.findMany({
        include,
        orderBy: { createdAt: 'desc' }
      });
      return data as T[];
    }
  } catch (error) {
    console.error(`Error fetching ${String(model)}:`, error);
    throw error;
  }
}

// GET DOCUMENT - Fetch a single record by ID
export async function getDocument<T>(
  model: string,
  id: string,
  include?: any
): Promise<T | null> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/documents/${model}/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // Server-side: use Prisma directly
      if (!dbClient) {
        throw new Error('Database client not initialized');
      }
      const collection = dbClient[model] as any;
      const data = await collection.findUnique({
        where: { id },
        include
      });
      return data as T | null;
    }
  } catch (error) {
    console.error(`Error fetching ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// ADD DOCUMENT - Create a new record
export async function addDocument<T>(
  model: string,
  data: any
): Promise<T> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/collections/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // Server-side: use Prisma directly
      if (!dbClient) {
        throw new Error('Database client not initialized');
      }
      const collection = dbClient[model] as any;
      const result = await collection.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      return result as T;
    }
  } catch (error) {
    console.error(`Error adding ${String(model)}:`, error);
    throw error;
  }
}

// SET DOCUMENT - Create or update a record with specific ID
export async function setDocument<T>(
  model: string,
  id: string,
  data: any
): Promise<T> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/documents/${model}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // Server-side: use Prisma directly
      const collection = dbClient[model] as any;
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
    }
  } catch (error) {
    console.error(`Error setting ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// UPDATE DOCUMENT - Update an existing record
export async function updateDocument<T>(
  model: string,
  id: string,
  data: any
): Promise<T> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/documents/${model}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // Server-side: use Prisma directly
      if (!dbClient) {
        throw new Error('Database client not initialized');
      }
      const collection = dbClient[model] as any;
      const result = await collection.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      return result as T;
    }
  } catch (error) {
    console.error(`Error updating ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// DELETE DOCUMENT - Delete a record by ID
export async function deleteDocument(
  model: string,
  id: string
): Promise<void> {
  try {
    if (isBrowser()) {
      // Client-side: make API call
      const response = await fetch(`/api/documents/${model}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } else {
      // Server-side: use Prisma directly
      const collection = dbClient[model] as any;
      await collection.delete({
        where: { id }
      });
    }
  } catch (error) {
    console.error(`Error deleting ${String(model)} with id ${id}:`, error);
    throw error;
  }
}

// LISTEN TO COLLECTION - Real-time subscription (Note: PostgreSQL doesn't have native real-time like Firestore)
// This is a polling-based alternative - for true real-time, consider using Supabase or implementing WebSockets
export function listenToCollection<T>(
  model: string,
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
  if (isBrowser()) {
    // Client-side: make API call
    // Note: You would need to create a search API endpoint for this
    const response = await fetch(`/api/search/patients?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    if (!dbClient) {
      throw new Error('Database client not initialized');
    }
    try {
      const patients = await dbClient.patient.findMany({
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
}

// Get appointments by date range
export async function getAppointmentsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch(`/api/appointments/date-range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    if (!dbClient) {
      throw new Error('Database client not initialized');
    }
    try {
      const appointments = await dbClient.appointment.findMany({
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
}

// Get treatments for a patient
export async function getPatientTreatments(patientId: string): Promise<Treatment[]> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch(`/api/patients/${patientId}/treatments`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    try {
      const treatments = await dbClient.treatment.findMany({
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
}

// Get patient's medical records
export async function getPatientMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch(`/api/patients/${patientId}/medical-records`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    try {
      const records = await dbClient.medicalRecord.findMany({
        where: { patientId },
        orderBy: { date: 'desc' }
      });
      return records;
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      throw error;
    }
  }
}

// Get low stock inventory items
export async function getLowStockItems(): Promise<InventoryItem[]> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch('/api/inventory/low-stock');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    try {
      const items = await dbClient.inventoryItem.findMany({
        where: {
          quantity: {
            // Use a subquery or raw SQL for field comparison
            lte: 10 // Default min quantity threshold for now
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
}

// Get overdue invoices
export async function getOverdueInvoices(): Promise<Invoice[]> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch('/api/invoices/overdue');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } else {
    // Server-side: use Prisma directly
    try {
      const invoices = await dbClient.invoice.findMany({
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
}

// Batch operations
export async function batchCreateDocuments<T>(
  model: string,
  data: any[]
): Promise<void> {
  if (isBrowser()) {
    // Client-side: make API call
    const response = await fetch(`/api/collections/${model}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return;
  } else {
    // Server-side: use Prisma directly
    try {
      const collection = (dbClient as any)[model];
      if (!collection) {
        throw new Error(`Unknown model: ${model}`);
      }
      await collection.createMany({
        data: data.map(item => ({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      });
    } catch (error) {
      console.error(`Error batch creating ${model}:`, error);
      throw error;
    }
  }
}

// Transaction wrapper for complex operations (server-side only)
export async function executeTransaction<T>(
  operations: (tx: any) => Promise<T>
): Promise<T> {
  if (isBrowser()) {
    throw new Error('Transactions are not supported on client-side. Use individual API calls instead.');
  }
  
  try {
    return await dbClient.$transaction(operations);
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw error;
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  if (isBrowser()) {
    // Client-side: make API call
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  } else {
    // Server-side: direct database check
    try {
      await dbClient.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default prisma;


