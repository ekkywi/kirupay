-- CreateEnum
CREATE TYPE "RpcEndpointType" AS ENUM ('PRIMARY', 'FALLBACK');

-- CreateEnum
CREATE TYPE "RpcHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN');

-- CreateTable
CREATE TABLE "RpcHealthLog" (
    "id" TEXT NOT NULL,
    "endpointType" "RpcEndpointType" NOT NULL,
    "endpointUrlMasked" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "isReachable" BOOLEAN NOT NULL,
    "httpStatus" INTEGER,
    "errorType" TEXT,
    "status" "RpcHealthStatus" NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RpcHealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RpcHealthLog_checkedAt_idx" ON "RpcHealthLog"("checkedAt");

-- CreateIndex
CREATE INDEX "RpcHealthLog_endpointType_checkedAt_idx" ON "RpcHealthLog"("endpointType", "checkedAt");

-- CreateIndex
CREATE INDEX "RpcHealthLog_status_checkedAt_idx" ON "RpcHealthLog"("status", "checkedAt");
