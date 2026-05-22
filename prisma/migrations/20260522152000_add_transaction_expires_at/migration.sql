ALTER TABLE "Transaction"
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '30 minutes');

CREATE INDEX "Transaction_status_expiresAt_idx" ON "Transaction"("status", "expiresAt");
