import { prisma } from '@/lib/prisma';
import type { StaffMember, StaffStatus } from '@/lib/types';

export interface StaffCreateInput {
  name: string;
  role: string;
  email: string;
  phone: string;
  schedule: string;
  salary: string;
  hireDate: Date;
  status?: StaffStatus;
  notes?: string;
  userId?: string;
}

export type StaffUpdateInput = Partial<StaffCreateInput> & { id: string };

function mapRow(row: any): StaffMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    schedule: row.schedule,
    salary: row.salary,
    hireDate: row.hireDate.toISOString().slice(0, 10),
    status: row.status,
    notes: row.notes ?? undefined,
    userId: row.userId ?? undefined,
  };
}

async function list(): Promise<StaffMember[]> {
  const rows = await prisma.staff.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<StaffMember | null> {
  const row = await prisma.staff.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: StaffCreateInput): Promise<StaffMember> {
  const created = await prisma.staff.create({
    data: {
      name: input.name,
      role: input.role,
      email: input.email,
      phone: input.phone,
      schedule: input.schedule,
      salary: input.salary,
      hireDate: input.hireDate,
      status: input.status ?? 'Active',
      notes: input.notes ?? null,
      userId: input.userId ?? null,
    },
  });
  return mapRow(created);
}

async function update(input: StaffUpdateInput): Promise<StaffMember> {
  const updated = await prisma.staff.update({
    where: { id: input.id },
    data: {
      name: input.name,
      role: input.role,
      email: input.email,
      phone: input.phone,
      schedule: input.schedule,
      salary: input.salary,
      hireDate: input.hireDate,
      status: input.status as any,
      notes: input.notes ?? null,
      userId: input.userId ?? null,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.staff.delete({ where: { id } });
}

async function getByUserId(userId: string): Promise<StaffMember | null> {
  const row = await prisma.staff.findFirst({ where: { userId } });
  return row ? mapRow(row) : null;
}

async function updateStatusByUserId(userId: string, status: StaffStatus): Promise<StaffMember | null> {
  const staff = await prisma.staff.findFirst({ where: { userId } });
  if (!staff) return null;
  
  const updated = await prisma.staff.update({
    where: { id: staff.id },
    data: { status },
  });
  return mapRow(updated);
}

export const StaffService = { list, get, create, update, remove, getByUserId, updateStatusByUserId };
