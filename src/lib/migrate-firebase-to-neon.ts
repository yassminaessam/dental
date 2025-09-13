/**
 * Firebase to Neon Migration Utility
 * 
 * This script helps migrate data from Firebase Firestore to Neon PostgreSQL
 * Run this after setting up your Neon database and before switching the application
 */

// Legacy Firebase migration script (DECOMMISSIONED)
// This file is retained only to avoid breaking historical references.
// The operational migration path is now via direct SQL/Prisma seed scripts.
// All Firebase imports removed.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { prisma } from '@/lib/prisma';

console.warn('[legacy] migrate-firebase-to-neon.ts is deprecated and does nothing now.');

// Removed firebase configuration & initialization.

interface MigrationStats {
  collections: string[];
  totalDocuments: number;
  migratedDocuments: number;
  errors: string[];
}

// No-op export to satisfy potential imports.
export const FirebaseToNeonMigrator = class { async migrate() { console.log('noop migration'); return { collections: [], totalDocuments: 0, migratedDocuments: 0, errors: [] }; } };