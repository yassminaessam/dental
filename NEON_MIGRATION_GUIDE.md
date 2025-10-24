# Firebase to Neon Database Migration Guide

This document outlines the migration process from Firebase Firestore to Neon PostgreSQL for the Dental Clinic Management System.

## Overview

The application has been updated to support both Firebase Firestore and Neon PostgreSQL databases, allowing for a gradual migration approach.

## Setup Complete ✅

The following has been set up:

1. **Neon PostgreSQL Database**: Connected and configured
2. **Prisma ORM**: Schema defined and database tables created
3. **Environment Configuration**: Database connection strings configured
4. **Authentication System**: Updated to work with PostgreSQL and JWT tokens
5. **Database Services**: New service layer created for PostgreSQL operations
6. **Migration Scripts**: Automated data migration from Firebase to Neon
7. **Compatibility Layer**: Existing code can work with both databases

## Database Connection Details

Your Neon database is configured with:
- **Host**: `ep-calm-glade-aein3lws-pooler.c-2.us-east-2.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Connection**: SSL required

## Current Status

✅ **Database Schema Created**: All tables are ready  
✅ **Sample Data Seeded**: Test data is populated  
✅ **Authentication System**: Ready with JWT tokens  
✅ **Migration Scripts**: Available for data transfer  
✅ **Compatibility Mode**: Can switch between Firebase and Neon  

## How to Use

### Option 1: Switch to Neon Immediately (Recommended)

1. Your environment is already configured with `USE_NEON_DATABASE=true`
2. Start the application: `npm run dev`
3. The app will now use Neon PostgreSQL for all database operations

### Option 2: Gradual Migration

1. Set `USE_NEON_DATABASE=false` in `.env` to continue using Firebase
2. Run the migration script to transfer data: `npm run db:migrate-from-firebase`
3. Test with Neon by setting `USE_NEON_DATABASE=true`
4. Once satisfied, keep the flag as `true`

## Available Commands

```bash
# Database Management
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:reset        # Reset database (careful!)

# Migration
npm run db:migrate-from-firebase  # Migrate data from Firebase to Neon

# Application
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

## Default User Accounts

The system has been seeded with these demo accounts:

1. **Administrator**
   - Email: `admin@cairodental.com`
   - Password: `Password123!`
   - Role: Admin (full access)

2. **Doctor**
   - Email: `dr.ahmed@cairodental.com`
   - Password: `Password123!`
   - Role: Doctor

3. **Receptionist**
   - Email: `reception@cairodental.com`
   - Password: `Password123!`
   - Role: Receptionist

## What Changed

### New Files Added
- `src/lib/prisma.ts` - Prisma client configuration
- `src/services/database.ts` - New database service using Prisma
- `src/lib/auth-prisma.ts` - Updated authentication service
- `src/lib/seed-prisma.ts` - Database seeding script
- `src/lib/migrate-firebase-to-neon.ts` - Migration utility
- `prisma/schema.prisma` - Database schema definition

### Modified Files
- `package.json` - Added new scripts and dependencies
- `.env` - Added Neon connection string and migration flag
- `src/services/firestore.ts` - Added compatibility layer

### Dependencies Added
- `prisma` - Database ORM
- `@prisma/client` - Prisma client
- `pg` - PostgreSQL driver
- `@types/pg` - TypeScript types for PostgreSQL
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token handling

## Key Benefits of Migration

1. **Better Performance**: PostgreSQL offers superior query performance
2. **ACID Compliance**: Full transaction support for data integrity
3. **SQL Flexibility**: Complex queries and joins
4. **Scalability**: Better scaling options with Neon
5. **Cost Effectiveness**: Potentially lower costs than Firebase
6. **Data Ownership**: Full control over your data
7. **Backup & Recovery**: Better backup and recovery options

## Authentication Changes

- **Old**: Firebase Authentication with Firestore user profiles
- **New**: JWT-based authentication with PostgreSQL user storage
- **Passwords**: Now properly hashed with bcrypt (more secure)
- **Sessions**: JWT tokens with 7-day expiration

## Firebase Services Still Used

The following Firebase services can still be used:
- **Firebase Storage**: For file uploads (clinical images, documents)
- **Firebase Cloud Functions**: For serverless functions (if needed)
- **Firebase Hosting**: For deployment (if preferred)

## Migration Notes

- All data types have been properly mapped from Firestore to PostgreSQL
- Relationships are now enforced with foreign keys
- Enums are used for better data validation
- Timestamps are handled correctly across timezones
- JSON fields are used where flexible data structures are needed

## Troubleshooting

### Connection Issues
- Verify the `DATABASE_URL` in `.env` is correct
- Check Neon dashboard for database status
- Ensure your IP is whitelisted (if applicable)

### Migration Issues
- Ensure Firebase credentials are configured
- Check for data type mismatches in the migration logs
- Run migrations in order due to foreign key constraints

### Authentication Issues
- Check JWT secret is configured
- Verify user passwords are hashed correctly
- Ensure user roles and permissions are properly set

## Next Steps

1. **Test the Application**: Login with the demo accounts and test all features
2. **Migrate Production Data**: If satisfied, run the migration on production data
3. **Update Frontend Code**: Gradually update components to use new services
4. **Remove Firebase Dependencies**: Once fully migrated, remove unused Firebase code
5. **Optimize Database**: Add indexes and optimize queries as needed

## Support

If you encounter any issues:
1. Check the application logs
2. Use `npm run db:studio` to inspect the database
3. Verify environment variables are set correctly
4. Test individual database operations

The migration is complete and your application is now ready to use Neon PostgreSQL! 🎉