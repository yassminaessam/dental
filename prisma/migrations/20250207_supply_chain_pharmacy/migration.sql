-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('InStock', 'LowStock', 'OutOfStock');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('Active', 'Completed');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('Pending', 'Shipped', 'Delivered', 'Cancelled');

-- CreateEnum
CREATE TYPE "PharmacyTransactionType" AS ENUM ('Revenue', 'Expense');

-- CreateEnum
CREATE TYPE "PharmacyTransactionStatus" AS ENUM ('Pending', 'Completed');

-- AlterTable
ALTER TABLE "ClinicSettings" ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "weeklySchedule" JSONB;

-- AlterTable
ALTER TABLE "ClinicalImage" ADD COLUMN     "toothNumber" INTEGER;

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "strength" TEXT,
    "form" TEXT,
    "category" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "MedicationStatus" NOT NULL DEFAULT 'InStock',
    "inventoryItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "medicationId" TEXT,
    "medicationName" TEXT NOT NULL,
    "strength" TEXT,
    "dosage" TEXT,
    "instructions" TEXT,
    "duration" TEXT,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'Active',
    "invoiceId" TEXT,
    "treatmentId" TEXT,
    "dispensedAt" TIMESTAMP(3),
    "dispensedQuantity" INTEGER,
    "totalAmount" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyDispense" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "medicationId" TEXT,
    "patientId" TEXT,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "invoiceId" TEXT,
    "treatmentId" TEXT,
    "notes" TEXT,
    "dispensedBy" TEXT,
    "dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyDispense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT,
    "supplierName" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'Pending',
    "total" DECIMAL(12,2) NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3),
    "items" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "amountValue" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2),
    "outstandingAmount" DECIMAL(12,2),
    "type" "PharmacyTransactionType" NOT NULL,
    "category" TEXT,
    "status" "PharmacyTransactionStatus" NOT NULL DEFAULT 'Completed',
    "paymentMethod" TEXT,
    "patientId" TEXT,
    "patientName" TEXT,
    "sourceId" TEXT,
    "sourceType" TEXT,
    "metadata" JSONB,
    "auto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Medication_status_idx" ON "Medication"("status");

-- CreateIndex
CREATE INDEX "Medication_category_idx" ON "Medication"("category");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "PharmacyDispense_prescriptionId_idx" ON "PharmacyDispense"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacyDispense_medicationId_idx" ON "PharmacyDispense"("medicationId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PharmacyTransaction_type_idx" ON "PharmacyTransaction"("type");

-- CreateIndex
CREATE INDEX "PharmacyTransaction_status_idx" ON "PharmacyTransaction"("status");

-- CreateIndex
CREATE INDEX "PharmacyTransaction_patientId_idx" ON "PharmacyTransaction"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalImage_toothNumber_idx" ON "ClinicalImage"("toothNumber");

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispense" ADD CONSTRAINT "PharmacyDispense_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispense" ADD CONSTRAINT "PharmacyDispense_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

