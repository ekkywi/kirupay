-- CreateTable
CREATE TABLE "internal_user_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "InternalRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_user_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internal_user_invites_tokenHash_key" ON "internal_user_invites"("tokenHash");
CREATE INDEX "internal_user_invites_email_createdAt_idx" ON "internal_user_invites"("email", "createdAt");
CREATE INDEX "internal_user_invites_expiresAt_usedAt_idx" ON "internal_user_invites"("expiresAt", "usedAt");

-- AddForeignKey
ALTER TABLE "internal_user_invites"
ADD CONSTRAINT "internal_user_invites_invitedBy_fkey"
FOREIGN KEY ("invitedBy") REFERENCES "internal_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
