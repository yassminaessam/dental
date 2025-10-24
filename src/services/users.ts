import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import type { User, UserRole, UserPermission, RegisterData } from '@/lib/types';

// Map DB user to app User type (excluding passwordHash)
function mapDbUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    permissions: u.permissions as UserPermission[],
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt ?? undefined,
    specialization: u.specialization ?? undefined,
    licenseNumber: u.licenseNumber ?? undefined,
    employeeId: u.employeeId ?? undefined,
    department: u.department ?? undefined,
    patientId: u.patientId ?? undefined,
    phone: u.phone ?? undefined,
    address: u.address ?? undefined,
    profileImageUrl: u.profileImageUrl ?? undefined,
  };
}

export const UsersService = {
  async getById(id: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? mapDbUser(u) : null;
  },

  async getByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    const mapped = mapDbUser(u) as any;
    mapped.passwordHash = u.passwordHash;
    return mapped;
  },

  async listAll(): Promise<User[]> {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapDbUser);
  },

  async listByRole(role: UserRole): Promise<User[]> {
    const rows = await prisma.user.findMany({ where: { role } });
    return rows.map(mapDbUser);
  },

  async create(data: RegisterData & { permissions: UserPermission[] }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        permissions: data.permissions,
        isActive: true,
        specialization: data.specialization ?? null,
        licenseNumber: data.licenseNumber ?? null,
        employeeId: data.employeeId ?? null,
        department: data.department ?? null,
        phone: data.phone ?? null,
      },
    });
    return mapDbUser(created);
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & { password?: string }): Promise<User> {
    const { password, ...rest } = updates as any;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({ where: { id }, data });
    return mapDbUser(updated);
  },

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
};
 
