-- CreateTable
CREATE TABLE "PlatformMaintenance" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL DEFAULT 'Sistem sedang dalam pemeliharaan. Silakan coba lagi beberapa saat lagi.',
    "maintenanceEndsAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "updatedByEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformMaintenance_pkey" PRIMARY KEY ("id")
);