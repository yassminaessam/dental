# Dental Integration Migration: Firebase → Neon Database

## Summary
Migrated the dental integration service from Firebase to use only Neon PostgreSQL database. All tooth-image linking now uses the `toothNumber` field directly in the `ClinicalImage` table.

## Changes Made

### 1. Updated Dental Integration Service (`src/services/dental-integration.ts`)
**Removed:**
- Firebase imports (`listCollection`, `createDocument`, `generateDocumentId`)
- `ToothImageLink` interface (Firebase collection)
- `DentalTreatmentRecord` interface with Firebase-specific fields

**Updated Methods:**
- `linkImageToTooth()` - Now updates the `toothNumber` field in Neon via API
- `getToothImages()` - Already fetches from Neon database by `toothNumber`
- `createImageRecord()` - Now creates records in Neon database via API

### 2. Database Schema
The `ClinicalImage` table in Neon already has:
```prisma
model ClinicalImage {
  id          String   @id @default(uuid())
  patient     String
  patientId   String?
  type        String
  imageUrl    String
  caption     String?
  toothNumber Int?     // ← Used for linking images to teeth
  date        DateTime
  @@index([toothNumber])
}
```

### 3. Scripts Created

#### `scripts/quick-update-tooth.js`
**Purpose:** Quickly update the most recent X-Ray image
**Usage:**
```bash
node scripts/quick-update-tooth.js <toothNumber>
# Example: node scripts/quick-update-tooth.js 15
```

#### `scripts/update-image-tooth.js`
**Purpose:** Update specific images by index or ID
**Usage:**
```bash
# By index
node scripts/update-image-tooth.js <index> <toothNumber>

# By ID
node scripts/update-image-tooth.js <imageId> <toothNumber>
```

#### `scripts/batch-update-images.js`
**Purpose:** Batch operations for multiple images
**Commands:**
```bash
# List all images without tooth numbers
node scripts/batch-update-images.js list

# Update all images for a patient
node scripts/batch-update-images.js update-patient Ahmed 15

# Update by caption pattern
node scripts/batch-update-images.js update-by-caption "tooth #15" 15
```

## How It Works Now

### Uploading Images
1. **From Medical Records:**
   - Images are uploaded without tooth number (general patient images)
   - Can be viewed in "السجلات الطبية" (Medical Records)

2. **From Dental Chart:**
   - Select a tooth (e.g., tooth #15)
   - Click upload button
   - Image is automatically linked to that tooth via `toothNumber` field
   - Appears in both Medical Records and Dental Chart

### Viewing Images
1. **Medical Records Page:**
   - Shows ALL images for the patient
   - Filterable by type (X-Ray, Intraoral Photo, etc.)

2. **Dental Chart - Tooth Detail Card:**
   - Select a tooth
   - Go to "صور سريرية" (Images) tab
   - Shows ONLY images linked to that specific tooth
   - Click image to view full size

## Migration Completed

✅ **Existing Image Updated:**
- Patient: Ahmed
- Type: X-Ray
- Linked to: Tooth #15
- Now visible in dental chart when tooth #15 is selected

✅ **Firebase Dependencies Removed:**
- No more `tooth-image-links` collection
- All data stored in Neon PostgreSQL
- Simpler, more maintainable architecture

## Next Steps

1. **Upload New Images:**
   - Go to Dental Chart (مخطط الأسنان)
   - Select a tooth
   - Click upload in the images tab
   - Images will automatically link to that tooth

2. **Update Old Images:**
   - Use the batch script to link existing images
   - Or upload new images with proper tooth numbers

3. **Delete Old Images:**
   - Remove images without tooth numbers if no longer needed
   - Or batch-update them using the scripts provided
