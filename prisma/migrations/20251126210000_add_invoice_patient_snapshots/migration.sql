-- Add patient contact snapshots to invoices for billing phone display
ALTER TABLE "Invoice"
  ADD COLUMN "patientNameSnapshot" TEXT,
  ADD COLUMN "patientPhoneSnapshot" TEXT;
