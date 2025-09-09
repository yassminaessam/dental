import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

// Create a single instance of Prisma Client
export const prisma = globalThis.prisma || new PrismaClient();

// In development, store the instance on globalThis to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;