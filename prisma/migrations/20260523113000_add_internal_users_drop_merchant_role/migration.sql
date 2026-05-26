-- CreateEnum
CREATE TYPE "InternalRole" AS ENUM ('SUPERADMIN', 'SUPPORT', 'DEVELOPER');

-- CreateTable
CREATE TABLE "internal_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "InternalRole" NOT NULL DEFAULT 'SUPPORT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internal_users_email_key" ON "internal_users"("email");

-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "role";

-- Cleanup legacy enum no longer used by Merchant.
DROP TYPE IF EXISTS "Role";
