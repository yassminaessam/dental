# Dental Management System

🚀 **Elite Maritime Style Dental Management Application**

## Features
- ✅ Patient Management with Elite styling
- ✅ Appointment Scheduling  
- ✅ Medical Records
- ✅ Billing & Insurance
- ✅ Staff Management
- ✅ Inventory Tracking
- ✅ Analytics Dashboard
- ✅ Top-right positioned dialogs
- ✅ Enhanced gradient text visibility

## Tech Stack
- Next.js 15.3.3
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon Database
- Firebase Authentication
- Vercel Deployment

## Deployment
- **Live URL**: https://dental-blush.vercel.app
- **Auto-deployment**: ✅ Connected to GitHub
- **Last updated**: September 10, 2025

## Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run deploy # Deploy to Vercel
```
### FTPS Asset Storage (Interim Solution)

The project includes an interim FTPS-based storage driver for user uploads (clinical images, documents, etc.) served from `https://dental.adsolutions-eg.com/assets`.

1. Copy `.env.example` to `.env.local` and provide real FTPS credentials (never commit them).
2. Ensure the target directory exists: `/www/dental.adsolutions-eg.com/assets`.
3. The upload API route: `POST /api/uploads` with `multipart/form-data` field `file`.
4. Response JSON: `{ url, path, driver }`.

Environment variables:

```
FTPS_HOST=ftps5.us.freehostia.com
FTPS_USER=...          # rotate if previously shared
FTPS_PASSWORD=...      # rotate if previously shared
FTPS_BASE_DIR=/www/dental.adsolutions-eg.com/assets
PUBLIC_ASSETS_BASE=https://dental.adsolutions-eg.com/assets
STORAGE_DRIVER=ftps
```

Security notes:
- Treat FTPS credentials as secrets; rotate immediately if exposed.
- All uploaded files become publicly readable by URL.
- Do not store sensitive/PHI data here without an encrypted & access-controlled solution.
- Plan migration to S3/R2 for signed URLs, better durability, and lifecycle policies.

Future migration path: Implement an `S3StorageDriver` with the same interface and switch via `STORAGE_DRIVER` env. The current FTPS driver already conforms to a generic `StorageDriver` interface.

```

---
*Powered by Elite Maritime Design System* 🌊
