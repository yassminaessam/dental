/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clinic_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clinical_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurance_claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurance_providers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medical_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portal_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prescription_medications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prescriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `referrals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tooth_image_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treatments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "clinical_images" DROP CONSTRAINT "clinical_images_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "clinical_images" DROP CONSTRAINT "clinical_images_patientId_fkey";

-- DropForeignKey
ALTER TABLE "insurance_claims" DROP CONSTRAINT "insurance_claims_patientId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patientId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_treatmentId_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_patientId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_patientId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "portal_users" DROP CONSTRAINT "portal_users_patientId_fkey";

-- DropForeignKey
ALTER TABLE "prescription_medications" DROP CONSTRAINT "prescription_medications_medicationId_fkey";

-- DropForeignKey
ALTER TABLE "prescription_medications" DROP CONSTRAINT "prescription_medications_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patientId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_patientId_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_referringDoctorId_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_specialistId_fkey";

-- DropForeignKey
ALTER TABLE "shared_documents" DROP CONSTRAINT "shared_documents_patientId_fkey";

-- DropForeignKey
ALTER TABLE "tooth_image_links" DROP CONSTRAINT "tooth_image_links_patientId_fkey";

-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_patientId_fkey";

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "clinic_settings";

-- DropTable
DROP TABLE "clinical_images";

-- DropTable
DROP TABLE "insurance_claims";

-- DropTable
DROP TABLE "insurance_providers";

-- DropTable
DROP TABLE "inventory";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "medical_records";

-- DropTable
DROP TABLE "medications";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "patients";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "portal_users";

-- DropTable
DROP TABLE "prescription_medications";

-- DropTable
DROP TABLE "prescriptions";

-- DropTable
DROP TABLE "purchase_order_items";

-- DropTable
DROP TABLE "purchase_orders";

-- DropTable
DROP TABLE "referrals";

-- DropTable
DROP TABLE "shared_documents";

-- DropTable
DROP TABLE "specialists";

-- DropTable
DROP TABLE "staff";

-- DropTable
DROP TABLE "suppliers";

-- DropTable
DROP TABLE "tooth_image_links";

-- DropTable
DROP TABLE "transactions";

-- DropTable
DROP TABLE "treatments";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "ClaimStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "InventoryStatus";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "MessageCategory";

-- DropEnum
DROP TYPE "MessagePriority";

-- DropEnum
DROP TYPE "MessageStatus";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PortalUserStatus";

-- DropEnum
DROP TYPE "PrescriptionStatus";

-- DropEnum
DROP TYPE "PurchaseOrderStatus";

-- DropEnum
DROP TYPE "ReferralStatus";

-- DropEnum
DROP TYPE "ReferralType";

-- DropEnum
DROP TYPE "ReferralUrgency";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "TreatmentStatus";

-- DropEnum
DROP TYPE "UserPermission";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "employeeId" TEXT,
    "department" TEXT,
    "patientId" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "profileImageUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionDoc" (
    "id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionDoc_pkey" PRIMARY KEY ("collection","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CollectionDoc_collection_idx" ON "CollectionDoc"("collection");
