CREATE TABLE "BusinessInvite" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeHint" TEXT NOT NULL,
    "role" "BusinessRole" NOT NULL DEFAULT 'MEMBER',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessInvite_codeHash_key" ON "BusinessInvite"("codeHash");
CREATE INDEX "BusinessInvite_businessId_createdAt_idx" ON "BusinessInvite"("businessId", "createdAt");
CREATE INDEX "BusinessInvite_expiresAt_usedAt_idx" ON "BusinessInvite"("expiresAt", "usedAt");

ALTER TABLE "BusinessInvite" ADD CONSTRAINT "BusinessInvite_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessInvite" ADD CONSTRAINT "BusinessInvite_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
