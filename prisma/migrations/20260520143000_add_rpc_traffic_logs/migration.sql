-- CreateTable
CREATE TABLE "RpcTrafficLog" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "endpointType" "RpcEndpointType" NOT NULL,
    "endpointUrlMasked" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL,
    "failoverFromEndpointMasked" TEXT,
    "failoverReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RpcTrafficLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RpcTrafficLog_usedAt_idx" ON "RpcTrafficLog"("usedAt");

-- CreateIndex
CREATE INDEX "RpcTrafficLog_endpointType_usedAt_idx" ON "RpcTrafficLog"("endpointType", "usedAt");

-- CreateIndex
CREATE INDEX "RpcTrafficLog_failoverFromEndpointMasked_usedAt_idx" ON "RpcTrafficLog"("failoverFromEndpointMasked", "usedAt");
