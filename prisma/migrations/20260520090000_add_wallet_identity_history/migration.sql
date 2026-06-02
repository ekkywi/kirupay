-- CreateTable
CREATE TABLE "MerchantWalletIdentity" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantWalletIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantWalletIdentity_walletAddress_key" ON "MerchantWalletIdentity"("walletAddress");

-- CreateIndex
CREATE INDEX "MerchantWalletIdentity_merchantId_idx" ON "MerchantWalletIdentity"("merchantId");

-- AddForeignKey
ALTER TABLE "MerchantWalletIdentity" ADD CONSTRAINT "MerchantWalletIdentity_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill current active wallet ownership (skip placeholder wallets)
INSERT INTO "MerchantWalletIdentity" (
    "id", "merchantId", "walletAddress", "isActive", "linkedAt", "createdAt", "updatedAt"
)
SELECT
    m."id" || '_wallet_identity',
    m."id",
    m."walletAddress",
    true,
    m."createdAt",
    m."createdAt",
    NOW()
FROM "Merchant" m
WHERE m."walletAddress" NOT LIKE 'pending_%';
