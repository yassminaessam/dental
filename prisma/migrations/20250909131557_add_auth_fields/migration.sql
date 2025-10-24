-- CreateEnum
CREATE TYPE "public"."UserPermission" AS ENUM ('view_patients', 'edit_patients', 'delete_patients', 'view_appointments', 'edit_appointments', 'delete_appointments', 'view_treatments', 'edit_treatments', 'delete_treatments', 'view_billing', 'edit_billing', 'delete_billing', 'view_reports', 'edit_reports', 'view_staff', 'edit_staff', 'delete_staff', 'view_inventory', 'edit_inventory', 'view_settings', 'edit_settings', 'view_medical_records', 'edit_medical_records', 'view_dental_chart', 'edit_dental_chart', 'view_communications', 'send_communications', 'view_insurance', 'edit_insurance', 'view_analytics', 'view_own_data', 'view_patient_portal', 'edit_patient_portal');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "hashedPassword" TEXT;
