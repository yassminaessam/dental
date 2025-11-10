import { prisma } from '@/lib/prisma';

export type SupplierStatus = 'Active' | 'Inactive';

export interface SupplierCreateInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
  paymentTerms?: string;
  rating?: number;
  status?: SupplierStatus;
}

export type SupplierUpdateInput = Partial<SupplierCreateInput> & { id: string };

export interface Supplier {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
  paymentTerms?: string;
  rating?: number;
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

const mapRow = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  address: row.address ?? undefined,
  phone: row.phone ?? undefined,
  email: row.email ?? undefined,
  category: row.category ?? undefined,
  paymentTerms: row.paymentTerms ?? undefined,
  rating: row.rating ?? undefined,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function list(): Promise<Supplier[]> {
  const rows = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<Supplier | null> {
  const row = await prisma.supplier.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: SupplierCreateInput): Promise<Supplier> {
  const created = await prisma.supplier.create({
    data: {
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      category: input.category ?? null,
      paymentTerms: input.paymentTerms ?? null,
      rating: input.rating ?? null,
      status: input.status ?? 'Active',
    },
  });
  return mapRow(created);
}

async function update(input: SupplierUpdateInput): Promise<Supplier> {
  const updated = await prisma.supplier.update({
    where: { id: input.id },
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
      email: input.email,
      category: input.category,
      paymentTerms: input.paymentTerms,
      rating: input.rating,
      status: input.status as any,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.supplier.delete({ where: { id } });
}

export const SuppliersService = { list, get, create, update, remove };
