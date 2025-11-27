-- Ensure legacy invoices marked as Paid report the correct collected total
UPDATE "Invoice"
SET "amountPaid" = "amount"
WHERE "status" = 'Paid'
  AND COALESCE("amountPaid", 0) < "amount";

-- Guard against stale data where amountPaid accidentally exceeds the invoice amount
UPDATE "Invoice"
SET "amountPaid" = "amount"
WHERE COALESCE("amountPaid", 0) > "amount";
