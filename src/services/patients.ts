import prisma from '@/lib/db';
import type { Patient, PatientStatus, PatientFamilyMember } from '@/lib/types';

function mapRow(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    dob: new Date(row.dob),
    age: Math.max(0, Math.floor((Date.now() - new Date(row.dob).getTime()) / (365.25 * 24 * 3600 * 1000))),
    lastVisit: row.lastVisit ? new Date(row.lastVisit).toISOString() : '',
    status: (row.status as PatientStatus) ?? 'Active',
    address: row.address ?? undefined,
    ecName: row.ecName ?? undefined,
    ecPhone: row.ecPhone ?? undefined,
    ecRelationship: row.ecRelationship ?? undefined,
    insuranceProvider: row.insuranceProvider ?? undefined,
    policyNumber: row.policyNumber ?? undefined,
    medicalHistory: row.medicalHistory ?? undefined,
    profilePhotoUrl: row.profilePhotoUrl ?? undefined,
    allergies: row.allergies ?? undefined,
    bloodType: row.bloodType ?? undefined,
    createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
  };
}

export const PatientsService = {
  async list(): Promise<Patient[]> {
    const rows = await prisma.patient.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapRow);
  },
  async get(id: string): Promise<Patient | null> {
    const row = await prisma.patient.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  },
  async getWithFamily(id: string): Promise<Patient | null> {
    const row = await prisma.patient.findUnique({
      where: { id },
      include: {
        familyMembers: {
          include: {
            relative: true
          }
        }
      }
    });
    if (!row) return null;
    
    const patient = mapRow(row);
    patient.familyMembers = (row as any).familyMembers?.map((fm: any) => ({
      id: fm.id,
      relativeId: fm.relativeId,
      relativeName: `${fm.relative.name} ${fm.relative.lastName}`,
      relativePhone: fm.relative.phone,
      relationship: fm.relationship,
      isPrimaryContact: fm.isPrimaryContact,
      notes: fm.notes,
    })) ?? [];
    
    return patient;
  },
  async create(data: Omit<Patient, 'id' | 'age' | 'lastVisit'> & { lastVisit?: string }): Promise<Patient> {
    const created = await prisma.patient.create({
      data: {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
        status: (data.status as any) ?? 'Active',
        address: data.address ?? null,
        ecName: data.ecName ?? null,
        ecPhone: data.ecPhone ?? null,
        ecRelationship: data.ecRelationship ?? null,
        insuranceProvider: data.insuranceProvider ?? null,
        policyNumber: data.policyNumber ?? null,
        medicalHistory: (data.medicalHistory as any) ?? null,
        profilePhotoUrl: data.profilePhotoUrl ?? null,
        allergies: data.allergies ?? [],
        bloodType: data.bloodType ?? null,
      }
    });
    return mapRow(created);
  },
  async update(id: string, patch: Partial<Patient>): Promise<Patient> {
    const updated = await prisma.patient.update({
      where: { id },
      data: {
        name: patch.name,
        lastName: patch.lastName,
        email: patch.email,
        phone: patch.phone,
        dob: patch.dob,
        lastVisit: patch.lastVisit ? new Date(patch.lastVisit) : undefined,
        status: (patch.status as any) ?? undefined,
        address: patch.address,
        ecName: patch.ecName,
        ecPhone: patch.ecPhone,
        ecRelationship: patch.ecRelationship,
        insuranceProvider: patch.insuranceProvider,
        policyNumber: patch.policyNumber,
        medicalHistory: (patch.medicalHistory as any) ?? undefined,
        profilePhotoUrl: patch.profilePhotoUrl,
        allergies: patch.allergies,
        bloodType: patch.bloodType,
      }
    });
    return mapRow(updated);
  },
  async remove(id: string): Promise<void> {
    await prisma.patient.delete({ where: { id } });
  },
  
  // Family management
  async addFamilyMember(patientId: string, relativeId: string, relationship: string, isPrimaryContact: boolean = false, notes?: string): Promise<PatientFamilyMember> {
    const created = await prisma.patientFamily.create({
      data: {
        patientId,
        relativeId,
        relationship,
        isPrimaryContact,
        notes,
      },
      include: {
        relative: true
      }
    });
    
    return {
      id: created.id,
      relativeId: created.relativeId,
      relativeName: `${created.relative.name} ${created.relative.lastName}`,
      relativePhone: created.relative.phone,
      relationship: created.relationship,
      isPrimaryContact: created.isPrimaryContact,
      notes: created.notes ?? undefined,
    };
  },
  
  async removeFamilyMember(familyId: string): Promise<void> {
    await prisma.patientFamily.delete({ where: { id: familyId } });
  },
  
  async updateFamilyMember(familyId: string, data: { relationship?: string; isPrimaryContact?: boolean; notes?: string }): Promise<void> {
    await prisma.patientFamily.update({
      where: { id: familyId },
      data
    });
  }
};
