-- Create enums
CREATE TYPE "NotificationSource" AS ENUM ('PAYMENT', 'WEBHOOK');
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');
CREATE TYPE "NotificationType" AS ENUM (
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'PAYMENT_PENDING_TOO_LONG',
  'WEBHOOK_DELIVERY_FAILED',
  'WEBHOOK_RECOVERED'
);

-- Create preferences table
CREATE TABLE "MerchantNotificationPreference" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "paymentSuccess" BOOLEAN NOT NULL DEFAULT true,
  "paymentFailed" BOOLEAN NOT NULL DEFAULT true,
  "paymentPendingTooLong" BOOLEAN NOT NULL DEFAULT true,
  "webhookDeliveryFailed" BOOLEAN NOT NULL DEFAULT true,
  "webhookRecovered" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MerchantNotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MerchantNotificationPreference_merchantId_key" ON "MerchantNotificationPreference"("merchantId");

ALTER TABLE "MerchantNotificationPreference"
ADD CONSTRAINT "MerchantNotificationPreference_merchantId_fkey"
FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create notifications table
CREATE TABLE "MerchantNotification" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "source" "NotificationSource" NOT NULL,
  "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "sourceRefId" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MerchantNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MerchantNotification_merchantId_createdAt_idx" ON "MerchantNotification"("merchantId", "createdAt");
CREATE INDEX "MerchantNotification_merchantId_readAt_createdAt_idx" ON "MerchantNotification"("merchantId", "readAt", "createdAt");
CREATE INDEX "MerchantNotification_merchantId_severity_createdAt_idx" ON "MerchantNotification"("merchantId", "severity", "createdAt");
CREATE INDEX "MerchantNotification_merchantId_sourceRefId_type_createdAt_idx" ON "MerchantNotification"("merchantId", "sourceRefId", "type", "createdAt");

ALTER TABLE "MerchantNotification"
ADD CONSTRAINT "MerchantNotification_merchantId_fkey"
FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
