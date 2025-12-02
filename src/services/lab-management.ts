import { prisma } from '@/lib/prisma';

export type LabCaseStatus = 'Draft' | 'Submitted' | 'InProgress' | 'QualityCheck' | 'Completed' | 'Delivered' | 'Cancelled';
export type LabCasePriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface Lab {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  specialty?: string;
  rating?: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabCase {
  id: string;
  caseNumber: string;
  labId?: string;
  labName?: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  treatmentId?: string;
  caseType: string;
  toothNumbers?: string;
  shade?: string;
  material?: string;
  description?: string;
  instructions?: string;
  status: LabCaseStatus;
  priority: LabCasePriority;
  requestDate: Date;
  dueDate?: Date;
  sentToLabDate?: Date;
  receivedDate?: Date;
  deliveredDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
  invoiceId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: LabCaseAttachment[];
  updates?: LabCaseUpdate[];
  lab?: Lab;
}

export interface LabCaseAttachment {
  id: string;
  caseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  description?: string;
  uploadedBy?: string;
  createdAt: Date;
}

export interface LabCaseUpdate {
  id: string;
  caseId: string;
  status: LabCaseStatus;
  message?: string;
  updatedBy?: string;
  isSharedWithLab: boolean;
  createdAt: Date;
}

export interface LabCreateInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  specialty?: string;
  rating?: number;
  notes?: string;
}

export interface LabCaseCreateInput {
  labId?: string;
  labName?: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  treatmentId?: string;
  caseType: string;
  toothNumbers?: string;
  shade?: string;
  material?: string;
  description?: string;
  instructions?: string;
  priority?: LabCasePriority;
  dueDate?: Date;
  estimatedCost?: number;
  notes?: string;
  createdBy?: string;
}

export interface LabCaseUpdateInput {
  id: string;
  labId?: string;
  labName?: string;
  caseType?: string;
  toothNumbers?: string;
  shade?: string;
  material?: string;
  description?: string;
  instructions?: string;
  status?: LabCaseStatus;
  priority?: LabCasePriority;
  dueDate?: Date;
  sentToLabDate?: Date;
  receivedDate?: Date;
  deliveredDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
  invoiceId?: string;
  notes?: string;
}

// Generate unique case number
async function generateCaseNumber(): Promise<string> {
  const today = new Date();
  const prefix = `LAB${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const lastCase = await prisma.labCase.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: 'desc' },
  });
  
  let sequence = 1;
  if (lastCase) {
    const lastSequence = parseInt(lastCase.caseNumber.slice(-4), 10);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

// Lab CRUD operations
async function listLabs(): Promise<Lab[]> {
  const rows = await prisma.lab.findMany({
    orderBy: { name: 'asc' },
  });
  return rows.map(mapLab);
}

async function getLab(id: string): Promise<Lab | null> {
  const row = await prisma.lab.findUnique({ where: { id } });
  return row ? mapLab(row) : null;
}

async function createLab(input: LabCreateInput): Promise<Lab> {
  const created = await prisma.lab.create({
    data: {
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      contactName: input.contactName ?? null,
      specialty: input.specialty ?? null,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
    },
  });
  return mapLab(created);
}

async function updateLab(id: string, input: Partial<LabCreateInput>): Promise<Lab> {
  const updated = await prisma.lab.update({
    where: { id },
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
      email: input.email,
      contactName: input.contactName,
      specialty: input.specialty,
      rating: input.rating,
      notes: input.notes,
    },
  });
  return mapLab(updated);
}

async function deleteLab(id: string): Promise<void> {
  await prisma.lab.delete({ where: { id } });
}

// Lab Case CRUD operations
async function listCases(filters?: {
  status?: LabCaseStatus;
  labId?: string;
  patientId?: string;
  doctorId?: string;
  priority?: LabCasePriority;
  fromDate?: Date;
  toDate?: Date;
}): Promise<LabCase[]> {
  const where: any = {};
  
  if (filters?.status) where.status = filters.status;
  if (filters?.labId) where.labId = filters.labId;
  if (filters?.patientId) where.patientId = filters.patientId;
  if (filters?.doctorId) where.doctorId = filters.doctorId;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.fromDate || filters?.toDate) {
    where.requestDate = {};
    if (filters.fromDate) where.requestDate.gte = filters.fromDate;
    if (filters.toDate) where.requestDate.lte = filters.toDate;
  }
  
  const rows = await prisma.labCase.findMany({
    where,
    include: {
      lab: true,
      attachments: true,
      updates: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { requestDate: 'desc' },
  });
  
  return rows.map(mapCase);
}

async function getCase(id: string): Promise<LabCase | null> {
  const row = await prisma.labCase.findUnique({
    where: { id },
    include: {
      lab: true,
      attachments: true,
      updates: { orderBy: { createdAt: 'desc' } },
    },
  });
  return row ? mapCase(row) : null;
}

async function createCase(input: LabCaseCreateInput): Promise<LabCase> {
  const caseNumber = await generateCaseNumber();
  
  const created = await prisma.labCase.create({
    data: {
      caseNumber,
      labId: input.labId ?? null,
      labName: input.labName ?? null,
      patientId: input.patientId ?? null,
      patientName: input.patientName,
      doctorId: input.doctorId ?? null,
      doctorName: input.doctorName,
      treatmentId: input.treatmentId ?? null,
      caseType: input.caseType,
      toothNumbers: input.toothNumbers ?? null,
      shade: input.shade ?? null,
      material: input.material ?? null,
      description: input.description ?? null,
      instructions: input.instructions ?? null,
      status: 'Draft',
      priority: input.priority ?? 'Normal',
      dueDate: input.dueDate ?? null,
      estimatedCost: input.estimatedCost ?? null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? null,
    },
    include: {
      lab: true,
      attachments: true,
      updates: true,
    },
  });
  
  return mapCase(created);
}

async function updateCase(input: LabCaseUpdateInput): Promise<LabCase> {
  const updated = await prisma.labCase.update({
    where: { id: input.id },
    data: {
      labId: input.labId,
      labName: input.labName,
      caseType: input.caseType,
      toothNumbers: input.toothNumbers,
      shade: input.shade,
      material: input.material,
      description: input.description,
      instructions: input.instructions,
      status: input.status as any,
      priority: input.priority as any,
      dueDate: input.dueDate,
      sentToLabDate: input.sentToLabDate,
      receivedDate: input.receivedDate,
      deliveredDate: input.deliveredDate,
      estimatedCost: input.estimatedCost,
      actualCost: input.actualCost,
      invoiceId: input.invoiceId,
      notes: input.notes,
    },
    include: {
      lab: true,
      attachments: true,
      updates: { orderBy: { createdAt: 'desc' } },
    },
  });
  
  return mapCase(updated);
}

async function deleteCase(id: string): Promise<void> {
  await prisma.labCase.delete({ where: { id } });
}

// Update case status with tracking
async function updateCaseStatus(
  id: string,
  status: LabCaseStatus,
  message?: string,
  updatedBy?: string,
  shareWithLab?: boolean
): Promise<LabCase> {
  // Create status update record
  await prisma.labCaseUpdate.create({
    data: {
      caseId: id,
      status: status as any,
      message: message ?? null,
      updatedBy: updatedBy ?? null,
      isSharedWithLab: shareWithLab ?? false,
    },
  });
  
  // Update the case status and relevant dates
  const updateData: any = { status: status as any };
  
  if (status === 'Submitted') {
    updateData.sentToLabDate = new Date();
  } else if (status === 'Completed') {
    updateData.receivedDate = new Date();
  } else if (status === 'Delivered') {
    updateData.deliveredDate = new Date();
  }
  
  const updated = await prisma.labCase.update({
    where: { id },
    data: updateData,
    include: {
      lab: true,
      attachments: true,
      updates: { orderBy: { createdAt: 'desc' } },
    },
  });
  
  return mapCase(updated);
}

// Attachment operations
async function addAttachment(
  caseId: string,
  fileName: string,
  fileUrl: string,
  fileType: string,
  fileSize?: number,
  description?: string,
  uploadedBy?: string
): Promise<LabCaseAttachment> {
  const created = await prisma.labCaseAttachment.create({
    data: {
      caseId,
      fileName,
      fileUrl,
      fileType,
      fileSize: fileSize ?? null,
      description: description ?? null,
      uploadedBy: uploadedBy ?? null,
    },
  });
  return mapAttachment(created);
}

async function deleteAttachment(id: string): Promise<void> {
  await prisma.labCaseAttachment.delete({ where: { id } });
}

// Analytics
async function getAnalytics(fromDate?: Date, toDate?: Date) {
  const where: any = {};
  if (fromDate || toDate) {
    where.requestDate = {};
    if (fromDate) where.requestDate.gte = fromDate;
    if (toDate) where.requestDate.lte = toDate;
  }
  
  const cases = await prisma.labCase.findMany({ where });
  
  // Status breakdown
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Priority breakdown
  const priorityCounts = cases.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Case type breakdown
  const caseTypeCounts = cases.reduce((acc, c) => {
    acc[c.caseType] = (acc[c.caseType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate turnaround times for completed cases
  const completedCases = cases.filter(c => c.status === 'Completed' || c.status === 'Delivered');
  const turnaroundTimes = completedCases
    .filter(c => c.sentToLabDate && (c.receivedDate || c.deliveredDate))
    .map(c => {
      const start = new Date(c.sentToLabDate!).getTime();
      const end = new Date(c.receivedDate || c.deliveredDate!).getTime();
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Days
    });
  
  const avgTurnaroundDays = turnaroundTimes.length > 0
    ? turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length
    : 0;
  
  // Cost analysis
  const totalEstimatedCost = cases.reduce((sum, c) => sum + (Number(c.estimatedCost) || 0), 0);
  const totalActualCost = cases.reduce((sum, c) => sum + (Number(c.actualCost) || 0), 0);
  
  // Overdue cases
  const overdueCases = cases.filter(c => {
    if (!c.dueDate || c.status === 'Completed' || c.status === 'Delivered' || c.status === 'Cancelled') {
      return false;
    }
    return new Date(c.dueDate) < new Date();
  }).length;
  
  return {
    totalCases: cases.length,
    statusCounts,
    priorityCounts,
    caseTypeCounts,
    avgTurnaroundDays: Math.round(avgTurnaroundDays * 10) / 10,
    totalEstimatedCost,
    totalActualCost,
    overdueCases,
    completedCases: completedCases.length,
  };
}

// Get cases for a specific treatment
async function getCasesForTreatment(treatmentId: string): Promise<LabCase[]> {
  const rows = await prisma.labCase.findMany({
    where: { treatmentId },
    include: {
      lab: true,
      attachments: true,
      updates: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { requestDate: 'desc' },
  });
  return rows.map(mapCase);
}

// Mappers
function mapLab(row: any): Lab {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    contactName: row.contactName ?? undefined,
    specialty: row.specialty ?? undefined,
    rating: row.rating ?? undefined,
    isActive: row.isActive,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCase(row: any): LabCase {
  return {
    id: row.id,
    caseNumber: row.caseNumber,
    labId: row.labId ?? undefined,
    labName: row.labName ?? row.lab?.name ?? undefined,
    patientId: row.patientId ?? undefined,
    patientName: row.patientName,
    doctorId: row.doctorId ?? undefined,
    doctorName: row.doctorName,
    treatmentId: row.treatmentId ?? undefined,
    caseType: row.caseType,
    toothNumbers: row.toothNumbers ?? undefined,
    shade: row.shade ?? undefined,
    material: row.material ?? undefined,
    description: row.description ?? undefined,
    instructions: row.instructions ?? undefined,
    status: row.status,
    priority: row.priority,
    requestDate: row.requestDate,
    dueDate: row.dueDate ?? undefined,
    sentToLabDate: row.sentToLabDate ?? undefined,
    receivedDate: row.receivedDate ?? undefined,
    deliveredDate: row.deliveredDate ?? undefined,
    estimatedCost: row.estimatedCost ? Number(row.estimatedCost) : undefined,
    actualCost: row.actualCost ? Number(row.actualCost) : undefined,
    invoiceId: row.invoiceId ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.createdBy ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    attachments: row.attachments?.map(mapAttachment) ?? [],
    updates: row.updates?.map(mapUpdate) ?? [],
    lab: row.lab ? mapLab(row.lab) : undefined,
  };
}

function mapAttachment(row: any): LabCaseAttachment {
  return {
    id: row.id,
    caseId: row.caseId,
    fileName: row.fileName,
    fileUrl: row.fileUrl,
    fileType: row.fileType,
    fileSize: row.fileSize ?? undefined,
    description: row.description ?? undefined,
    uploadedBy: row.uploadedBy ?? undefined,
    createdAt: row.createdAt,
  };
}

function mapUpdate(row: any): LabCaseUpdate {
  return {
    id: row.id,
    caseId: row.caseId,
    status: row.status,
    message: row.message ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
    isSharedWithLab: row.isSharedWithLab,
    createdAt: row.createdAt,
  };
}

export const LabManagementService = {
  // Labs
  listLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
  // Cases
  listCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  updateCaseStatus,
  getCasesForTreatment,
  // Attachments
  addAttachment,
  deleteAttachment,
  // Analytics
  getAnalytics,
};
