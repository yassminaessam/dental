-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "lastVisit" TIMESTAMP(3),
    "status" "PatientStatus" NOT NULL DEFAULT 'Active',
    "address" TEXT,
    "ecName" TEXT,
    "ecPhone" TEXT,
    "ecRelationship" TEXT,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "medicalHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_status_idx" ON "Patient"("status");

-- CreateIndex
CREATE INDEX "Patient_lastVisit_idx" ON "Patient"("lastVisit");
