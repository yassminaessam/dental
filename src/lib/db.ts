import type { PrismaClient } from '@prisma/client';

const isServer = typeof window === 'undefined';

let prismaInstance: PrismaClient;

if (isServer) {
  // Dynamically import to avoid bundling Prisma in the browser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client') as typeof import('@prisma/client');
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
} else {
  // Provide a safe stub in the browser so accidental imports don't crash the app at module init time
  prismaInstance = new Proxy({}, {
    get() {
      throw new Error('PrismaClient cannot be used in the browser. Import server modules only on the server.');
    }
  }) as unknown as PrismaClient;
}

export const prisma = prismaInstance;
export default prismaInstance;
