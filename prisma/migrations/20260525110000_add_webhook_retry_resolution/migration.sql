ALTER TABLE "WebhookLog"
ADD COLUMN "retriedFromLogId" TEXT;

ALTER TABLE "WebhookLog"
ADD CONSTRAINT "WebhookLog_retriedFromLogId_fkey"
FOREIGN KEY ("retriedFromLogId") REFERENCES "WebhookLog"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "WebhookLog_retriedFromLogId_idx" ON "WebhookLog"("retriedFromLogId");
CREATE INDEX "WebhookLog_status_createdAt_idx" ON "WebhookLog"("status", "createdAt");
