# CairoDental (Next.js + Neon Postgres)

This app now uses Neon (Postgres) on Vercel. Firebase has been removed. A lightweight Firestore-compat shim remains only to keep some pages compiling while we finish migrating non-user collections.

### Setup (local)

1. Copy `.env.example` to `.env.local` and fill in your Neon connection string(s):

   - `DATABASE_URL` (pooled)
   - Optionally `DATABASE_URL_UNPOOLED` for long-running ops

   Do NOT commit `.env.local`.

2. Install dependencies and generate Prisma client:

   - `npm install`
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`

3. Start the dev server:

   - `npm run dev`

### Auth and storage

- Auth: `src/lib/auth.ts` now uses Prisma via `UsersService` with a simple localStorage session. You can later swap to NextAuth or Stack Auth if desired.
- Storage: `src/services/storage.ts` is a mock. For production, move to Vercel Blob (recommended) and wire uploads there.

### Status

- Prisma is configured with a `User` model aligned to current `src/lib/types.ts`.
- `src/services/users.ts` provides Postgres-backed CRUD for users.
- A Firestore compatibility shim exists at `src/services/firestore.ts` to keep pages compiling; it returns empty results for most collections until they’re migrated to SQL.
