-- CreateEnum
CREATE TYPE "MedicalRecordStatus" AS ENUM ('Draft', 'Final');

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "patient" TEXT NOT NULL,
    "patientId" TEXT,
    "type" TEXT NOT NULL,
    "complaint" TEXT,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MedicalRecordStatus" NOT NULL DEFAULT 'Final',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalImage" (
    "id" TEXT NOT NULL,
    "patient" TEXT NOT NULL,
    "patientId" TEXT,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_status_idx" ON "MedicalRecord"("status");

-- CreateIndex
CREATE INDEX "MedicalRecord_date_idx" ON "MedicalRecord"("date");

-- CreateIndex
CREATE INDEX "ClinicalImage_patientId_idx" ON "ClinicalImage"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalImage_date_idx" ON "ClinicalImage"("date");
