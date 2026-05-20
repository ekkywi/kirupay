-- CreateEnum
CREATE TYPE "IncidentSource" AS ENUM ('RPC_HEALTH');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "IncidentEventType" AS ENUM ('CREATED', 'UPDATED', 'RESOLVED');

-- CreateTable
CREATE TABLE "OperationalIncident" (
    "id" TEXT NOT NULL,
    "source" "IncidentSource" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'ACTIVE',
    "dedupKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "lastObservedAt" TIMESTAMP(3) NOT NULL,
    "healthyStreak" INTEGER NOT NULL DEFAULT 0,
    "primaryEndpointMasked" TEXT,
    "fallbackEndpointMasked" TEXT,
    "triggerMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalIncidentEvent" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "eventType" "IncidentEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalIncidentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationalIncident_status_lastObservedAt_idx" ON "OperationalIncident"("status", "lastObservedAt");

-- CreateIndex
CREATE INDEX "OperationalIncident_source_status_lastObservedAt_idx" ON "OperationalIncident"("source", "status", "lastObservedAt");

-- CreateIndex
CREATE INDEX "OperationalIncident_dedupKey_status_idx" ON "OperationalIncident"("dedupKey", "status");

-- CreateIndex
CREATE INDEX "OperationalIncidentEvent_incidentId_createdAt_idx" ON "OperationalIncidentEvent"("incidentId", "createdAt");

-- CreateIndex
CREATE INDEX "OperationalIncidentEvent_createdAt_idx" ON "OperationalIncidentEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "OperationalIncidentEvent" ADD CONSTRAINT "OperationalIncidentEvent_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "OperationalIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
