# Neon-Only Database Migration

- [x] Configure local `.env` with Neon credentials (no commit).

## Current Sprint: Remove Firestore Shim

- [ ] Build Prisma services for each legacy collection (patients, appointments, etc.).
- [ ] Refactor feature modules to call Prisma services instead of `@/services/datastore`.
- [ ] Delete `src/services/datastore.ts` once no call sites remain.
- [ ] Update all imports to use the new Prisma datastore.
- [ ] Replace Firestore compatibility layer with Prisma-based datastore module.
- [x] Migrate patients feature to Prisma datastore helpers.
- [ ] Remove Firebase-specific modules, scripts, and documentation.
- [ ] Update storage utilities to drop Firebase terminology.
- [ ] Run Prisma generate/migrate and verify the app builds.
