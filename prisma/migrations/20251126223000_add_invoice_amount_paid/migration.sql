-- Track paid amounts on invoices for accurate billing metrics
ALTER TABLE "Invoice"
  ADD COLUMN "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0;
