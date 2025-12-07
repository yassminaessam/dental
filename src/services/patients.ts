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
    console.log(`[PatientsService.update] Updating patient ${id} with:`, patch);
    
    // Build update data, only including fields that are explicitly set
    const updateData: any = {};
    
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.lastName !== undefined) updateData.lastName = patch.lastName;
    if (patch.email !== undefined) updateData.email = patch.email;
    if (patch.phone !== undefined) updateData.phone = patch.phone;
    if (patch.dob !== undefined) {
      // Handle dob - convert string to Date if needed
      updateData.dob = patch.dob instanceof Date ? patch.dob : new Date(patch.dob);
    }
    if (patch.lastVisit !== undefined && patch.lastVisit !== '') {
      // Handle lastVisit - convert string to Date if needed, skip empty strings
      updateData.lastVisit = new Date(patch.lastVisit);
    }
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.address !== undefined) updateData.address = patch.address || null;
    if (patch.ecName !== undefined) updateData.ecName = patch.ecName || null;
    if (patch.ecPhone !== undefined) updateData.ecPhone = patch.ecPhone || null;
    if (patch.ecRelationship !== undefined) updateData.ecRelationship = patch.ecRelationship || null;
    if (patch.insuranceProvider !== undefined) updateData.insuranceProvider = patch.insuranceProvider || null;
    if (patch.policyNumber !== undefined) updateData.policyNumber = patch.policyNumber || null;
    if (patch.medicalHistory !== undefined) updateData.medicalHistory = patch.medicalHistory;
    if (patch.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = patch.profilePhotoUrl || null;
    if (patch.allergies !== undefined) updateData.allergies = patch.allergies;
    if (patch.bloodType !== undefined) updateData.bloodType = patch.bloodType || null;
    
    console.log(`[PatientsService.update] Prisma update data:`, updateData);
    
    const updated = await prisma.patient.update({
      where: { id },
      data: updateData,
    });
    
    console.log(`[PatientsService.update] Updated patient result:`, { id: updated.id, status: updated.status });
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
