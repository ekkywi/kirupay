import prisma from "@/lib/neon";

export const PLATFORM_MAINTENANCE_ID = "global";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "The system is currently under maintenance. Please try again later.";

export type PlatformMaintenanceInput = {
  enabled: boolean;
  message?: string | null;
  maintenanceEndsAt?: Date | null;
  updatedById?: string | null;
  updatedByEmail?: string | null;
};

type MaintenanceRow = {
  id: string;
  enabled: boolean;
  message: string;
  maintenanceEndsAt: Date | string | null;
  updatedById: string | null;
  updatedByEmail: string | null;
  updatedAt: Date | string | null;
};

type PlatformMaintenanceModelDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  create: (args: {
    data: {
      id: string;
      enabled: boolean;
      message: string;
    };
  }) => Promise<unknown>;
  upsert: (args: {
    where: { id: string };
    create: {
      id: string;
      enabled: boolean;
      message: string;
      maintenanceEndsAt: Date | null;
      updatedById: string | null;
      updatedByEmail: string | null;
    };
    update: {
      enabled: boolean;
      message: string;
      maintenanceEndsAt: Date | null;
      updatedById: string | null;
      updatedByEmail: string | null;
    };
  }) => Promise<unknown>;
};

type PrismaWithOptionalMaintenance = typeof prisma & {
  platformMaintenance?: PlatformMaintenanceModelDelegate;
};

function isMissingRelationError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const maybe = err as { code?: string; message?: string };
  return maybe.code === "42P01" || (typeof maybe.message === "string" && maybe.message.includes("does not exist"));
}

async function ensurePlatformMaintenanceTable() {
  const escapedDefaultMessage = DEFAULT_MAINTENANCE_MESSAGE.replace(/'/g, "''");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlatformMaintenance" (
      "id" TEXT NOT NULL,
      "enabled" BOOLEAN NOT NULL DEFAULT false,
      "message" TEXT NOT NULL DEFAULT '${escapedDefaultMessage}',
      "maintenanceEndsAt" TIMESTAMP(3),
      "updatedById" TEXT,
      "updatedByEmail" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlatformMaintenance_pkey" PRIMARY KEY ("id")
    )
  `);
}

export async function getPlatformMaintenanceState() {
  const client = prisma as PrismaWithOptionalMaintenance;

  // Prefer the typed Prisma accessor when available.
  try {
    if (client.platformMaintenance && typeof client.platformMaintenance.findUnique === "function") {
      const existing = await client.platformMaintenance.findUnique({ where: { id: PLATFORM_MAINTENANCE_ID } });
      if (existing) return existing;

      return await client.platformMaintenance.create({
        data: {
          id: PLATFORM_MAINTENANCE_ID,
          enabled: false,
          message: DEFAULT_MAINTENANCE_MESSAGE,
        },
      });
    }
  } catch (err) {
    console.warn("Prisma model accessor for PlatformMaintenance not available, falling back to raw SQL.", err);
  }

  // Fallback for environments where the generated client doesn't expose the model yet.
  let rows: MaintenanceRow[] = [];
  try {
    rows = await prisma.$queryRaw`
      SELECT id, enabled, message, "maintenanceEndsAt", "updatedById", "updatedByEmail", "updatedAt"
      FROM "PlatformMaintenance"
      WHERE id = ${PLATFORM_MAINTENANCE_ID}
      LIMIT 1
    ` as MaintenanceRow[];
  } catch (err) {
    if (!isMissingRelationError(err)) {
      throw err;
    }
    await ensurePlatformMaintenanceTable();
    rows = await prisma.$queryRaw`
      SELECT id, enabled, message, "maintenanceEndsAt", "updatedById", "updatedByEmail", "updatedAt"
      FROM "PlatformMaintenance"
      WHERE id = ${PLATFORM_MAINTENANCE_ID}
      LIMIT 1
    ` as MaintenanceRow[];
  }

  if (rows && rows.length > 0) {
    const r = rows[0];
    return {
      id: r.id,
      enabled: Boolean(r.enabled),
      message: r.message,
      maintenanceEndsAt: r.maintenanceEndsAt ? new Date(r.maintenanceEndsAt) : null,
      updatedById: r.updatedById,
      updatedByEmail: r.updatedByEmail,
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
    };
  }

  // Create the singleton row via raw SQL and retry.
  try {
    await prisma.$executeRaw`
      INSERT INTO "PlatformMaintenance" ("id", "enabled", "message", "updatedAt")
      VALUES (${PLATFORM_MAINTENANCE_ID}, false, ${DEFAULT_MAINTENANCE_MESSAGE}, now())
    `;
  } catch (err) {
    if (!isMissingRelationError(err)) {
      throw err;
    }
    await ensurePlatformMaintenanceTable();
    await prisma.$executeRaw`
      INSERT INTO "PlatformMaintenance" ("id", "enabled", "message", "updatedAt")
      VALUES (${PLATFORM_MAINTENANCE_ID}, false, ${DEFAULT_MAINTENANCE_MESSAGE}, now())
      ON CONFLICT ("id") DO NOTHING
    `;
  }

  return getPlatformMaintenanceState();
}

export async function upsertPlatformMaintenanceState(input: PlatformMaintenanceInput) {
  const client = prisma as PrismaWithOptionalMaintenance;

  try {
    if (client.platformMaintenance && typeof client.platformMaintenance.upsert === "function") {
      return await client.platformMaintenance.upsert({
        where: { id: PLATFORM_MAINTENANCE_ID },
        create: {
          id: PLATFORM_MAINTENANCE_ID,
          enabled: input.enabled,
          message: input.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
          maintenanceEndsAt: input.maintenanceEndsAt ?? null,
          updatedById: input.updatedById ?? null,
          updatedByEmail: input.updatedByEmail ?? null,
        },
        update: {
          enabled: input.enabled,
          message: input.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
          maintenanceEndsAt: input.maintenanceEndsAt ?? null,
          updatedById: input.updatedById ?? null,
          updatedByEmail: input.updatedByEmail ?? null,
        },
      });
    }
  } catch (err) {
    console.warn("Prisma upsert accessor not available, falling back to raw SQL upsert-like behavior.", err);
  }

  // Fallback: try update, otherwise insert.
  let existing: Array<{ id: string }> = [];
  try {
    existing = await prisma.$queryRaw`
      SELECT id FROM "PlatformMaintenance" WHERE id = ${PLATFORM_MAINTENANCE_ID} LIMIT 1
    ` as Array<{ id: string }>;
  } catch (err) {
    if (!isMissingRelationError(err)) {
      throw err;
    }
    await ensurePlatformMaintenanceTable();
  }

  if (existing && existing.length > 0) {
    await prisma.$executeRaw`
      UPDATE "PlatformMaintenance"
      SET "enabled" = ${input.enabled},
          "message" = ${input.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE},
          "maintenanceEndsAt" = ${input.maintenanceEndsAt ?? null},
          "updatedById" = ${input.updatedById ?? null},
          "updatedByEmail" = ${input.updatedByEmail ?? null},
          "updatedAt" = now()
      WHERE id = ${PLATFORM_MAINTENANCE_ID}
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "PlatformMaintenance" ("id", "enabled", "message", "maintenanceEndsAt", "updatedById", "updatedByEmail", "updatedAt")
      VALUES (
        ${PLATFORM_MAINTENANCE_ID},
        ${input.enabled},
        ${input.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE},
        ${input.maintenanceEndsAt ?? null},
        ${input.updatedById ?? null},
        ${input.updatedByEmail ?? null},
        now()
      )
    `;
  }

  return getPlatformMaintenanceState();
}

export async function getPlatformOperationsSnapshot() {
  const unresolvedFailedWebhookWhere = {
    retriedFromLogId: null,
    OR: [{ status: null }, { status: { lt: 200 } }, { status: { gte: 300 } }],
    retryChildren: {
      none: {
        status: {
          gte: 200,
          lt: 300,
        },
      },
    },
  } as const;

  const [
    totalTransactions,
    pendingTransactions,
    failedTransactions,
    paidTransactions,
    activeMerchants,
    webhookTotal,
    failedWebhookLogs,
    recentFailedWebhookLogs,
    recentPendingTransactions,
  ] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.transaction.count({ where: { status: "FAILED" } }),
    prisma.transaction.count({ where: { status: "PAID" } }),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.webhookLog.count(),
    prisma.webhookLog.count({
      where: unresolvedFailedWebhookWhere,
    }),
    prisma.webhookLog.findMany({
      where: unresolvedFailedWebhookWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        business: {
          select: {
            name: true,
            contactEmail: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        business: {
          select: {
            name: true,
            contactEmail: true,
          },
        },
      },
    }),
  ]);

  return {
    totalTransactions,
    pendingTransactions,
    failedTransactions,
    paidTransactions,
    activeMerchants,
    webhookTotal,
    failedWebhookLogs,
    recentFailedWebhookLogs,
    recentPendingTransactions,
  };
}
