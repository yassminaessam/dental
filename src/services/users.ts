import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import type { User, UserRole, UserPermission, RegisterData } from '@/lib/types';
import type { User as PrismaUser, Prisma } from '@prisma/client';

// Map DB user to app User type (excluding hashedPassword)
function mapDbUser(u: PrismaUser): User {
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

  async getByEmail(email: string): Promise<(User & { hashedPassword?: string }) | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    const mapped = mapDbUser(u);
    // Backward-compat: some environments may still have the column named `passwordHash`.
    // Prefer `hashedPassword` if present; otherwise fall back to `passwordHash`.
    const hashed: string | undefined = (u as any).hashedPassword ?? (u as any).passwordHash ?? undefined;
    return { ...mapped, hashedPassword: hashed };
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
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const created = await prisma.user.create({
      data: {
        email: data.email,
        hashedPassword,
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

  async update(
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & { password?: string }
  ): Promise<User> {
    const { password, ...rest } = updates;

    const data: Prisma.UserUncheckedUpdateInput = {
      email: rest.email,
      firstName: rest.firstName,
      lastName: rest.lastName,
      role: rest.role,
      permissions: rest.permissions as unknown as string[] | undefined,
      isActive: rest.isActive,
      specialization: rest.specialization ?? undefined,
      licenseNumber: rest.licenseNumber ?? undefined,
      employeeId: rest.employeeId ?? undefined,
      department: rest.department ?? undefined,
      patientId: rest.patientId ?? undefined,
      phone: rest.phone ?? undefined,
      address: rest.address ?? undefined,
      profileImageUrl: rest.profileImageUrl ?? undefined,
    };

    if (password) {
      data.hashedPassword = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data });
    return mapDbUser(updated);
  },

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
};
 
