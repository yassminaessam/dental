import prisma from '@/lib/db';

export interface SpecialistData {
  id: string;
  name: string;
  specialty: string;
  phone?: string | null;
  email?: string | null;
  clinicName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Specialists are stored in CollectionDoc since there's no dedicated Prisma model
// This service wraps the CollectionDoc operations for specialists

export const SpecialistsService = {
  async list(): Promise<SpecialistData[]> {
    const rows = await prisma.collectionDoc.findMany({
      where: { collection: 'specialists' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      ...(row.data as Record<string, unknown>),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as SpecialistData));
  },

  async get(id: string): Promise<SpecialistData | null> {
    const row = await prisma.collectionDoc.findUnique({
      where: { collection_id: { collection: 'specialists', id } },
    });
    if (!row) return null;
    return {
      id: row.id,
      ...(row.data as Record<string, unknown>),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as SpecialistData;
  },

  async create(data: Omit<SpecialistData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpecialistData> {
    const id = `SPEC-${Date.now()}`;
    const row = await prisma.collectionDoc.create({
      data: {
        collection: 'specialists',
        id,
        data: {
          name: data.name,
          specialty: data.specialty,
          phone: data.phone ?? null,
          email: data.email ?? null,
          clinicName: data.clinicName ?? null,
        },
      },
    });
    return {
      id: row.id,
      ...(row.data as Record<string, unknown>),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as SpecialistData;
  },

  async update(id: string, patch: Partial<Omit<SpecialistData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SpecialistData> {
    const existing = await prisma.collectionDoc.findUnique({
      where: { collection_id: { collection: 'specialists', id } },
    });
    if (!existing) throw new Error(`Specialist not found: ${id}`);

    const existingData = existing.data as Record<string, unknown>;
    const newData = { ...existingData, ...patch };

    const row = await prisma.collectionDoc.update({
      where: { collection_id: { collection: 'specialists', id } },
      data: { data: newData },
    });

    return {
      id: row.id,
      ...(row.data as Record<string, unknown>),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as SpecialistData;
  },

  async delete(id: string): Promise<void> {
    await prisma.collectionDoc.delete({
      where: { collection_id: { collection: 'specialists', id } },
    });
  },
};
