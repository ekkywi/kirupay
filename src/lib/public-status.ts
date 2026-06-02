import prisma from "@/lib/neon";
import { getPlatformMaintenanceState } from "@/lib/platform-maintenance";

export type PublicSystemStatus = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE";
export type PublicIncidentPhase = "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";

export type PublicComponentStatus = {
  name: "Checkout" | "Webhook delivery" | "Dashboard/API";
  status: "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE";
  message: string;
};

export type PublicIncident = {
  id: string;
  title: string;
  impact: PublicSystemStatus;
  phase: PublicIncidentPhase;
  startedAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
};

export type PublicStatusSummary = {
  systemStatus: PublicSystemStatus;
  lastUpdated: Date;
  maintenance: {
    enabled: boolean;
    message: string;
    maintenanceEndsAt: Date | null;
  };
  affectedComponents: PublicComponentStatus[];
  activeIncidents: PublicIncident[];
  resolvedIncidents: PublicIncident[];
};

type IncidentRow = {
  id: string;
  severity: "WARNING" | "CRITICAL";
  status: "ACTIVE" | "RESOLVED";
  title: string;
  startedAt: Date | string;
  resolvedAt: Date | string | null;
  updatedAt: Date | string;
};

type LatestEventRow = {
  incidentId: string;
  eventType: "CREATED" | "UPDATED" | "RESOLVED";
  createdAt: Date | string;
};

function mapSeverityToImpact(severity: IncidentRow["severity"]): PublicSystemStatus {
  return severity === "CRITICAL" ? "PARTIAL_OUTAGE" : "DEGRADED";
}

function deriveSystemStatus(maintenanceEnabled: boolean, activeIncidents: IncidentRow[]): PublicSystemStatus {
  if (maintenanceEnabled) return "MAJOR_OUTAGE";
  if (activeIncidents.length === 0) return "OPERATIONAL";

  const criticalCount = activeIncidents.filter((incident) => incident.severity === "CRITICAL").length;
  if (criticalCount >= 2) return "MAJOR_OUTAGE";
  if (criticalCount >= 1) return "PARTIAL_OUTAGE";
  return "DEGRADED";
}

function derivePhase(row: IncidentRow, latestEventType: LatestEventRow["eventType"] | null): PublicIncidentPhase {
  if (row.status === "RESOLVED") return "RESOLVED";
  if (latestEventType === "CREATED") return "INVESTIGATING";

  const ageMs = Date.now() - new Date(row.startedAt).getTime();
  if (ageMs > 20 * 60 * 1000) return "MONITORING";
  return "IDENTIFIED";
}

function toPublicIncident(row: IncidentRow, latestEventType: LatestEventRow["eventType"] | null): PublicIncident {
  return {
    id: row.id,
    title: row.title,
    impact: row.status === "ACTIVE" ? mapSeverityToImpact(row.severity) : "OPERATIONAL",
    phase: derivePhase(row, latestEventType),
    startedAt: new Date(row.startedAt),
    updatedAt: new Date(row.updatedAt),
    resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
  };
}

function buildComponentStatuses(
  systemStatus: PublicSystemStatus,
  maintenanceEnabled: boolean,
  hasActiveIncident: boolean,
): PublicComponentStatus[] {
  const checkoutStatus = maintenanceEnabled
    ? "MAJOR_OUTAGE"
    : systemStatus === "PARTIAL_OUTAGE" || systemStatus === "MAJOR_OUTAGE"
      ? "PARTIAL_OUTAGE"
      : systemStatus === "DEGRADED"
        ? "DEGRADED"
        : "OPERATIONAL";

  const webhookStatus = hasActiveIncident && systemStatus !== "OPERATIONAL" ? "DEGRADED" : "OPERATIONAL";
  const dashboardStatus = hasActiveIncident && (systemStatus === "PARTIAL_OUTAGE" || systemStatus === "MAJOR_OUTAGE") ? "DEGRADED" : "OPERATIONAL";

  return [
    {
      name: "Checkout",
      status: checkoutStatus,
      message: maintenanceEnabled ? "Payments are temporarily paused due to maintenance." : "Hosted checkout and payment routing.",
    },
    {
      name: "Webhook delivery",
      status: webhookStatus,
      message: "Payment status webhooks and merchant delivery pipeline.",
    },
    {
      name: "Dashboard/API",
      status: dashboardStatus,
      message: "Merchant dashboard access and checkout session API.",
    },
  ];
}

function isMissingRelationError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const maybe = err as { code?: string; message?: string };
  return maybe.code === "42P01" || (typeof maybe.message === "string" && maybe.message.includes("does not exist"));
}

export async function getPublicStatusSummary(): Promise<PublicStatusSummary> {
  const maintenance = await getPlatformMaintenanceState();

  let activeRows: IncidentRow[] = [];
  let resolvedRows: IncidentRow[] = [];
  let eventRows: LatestEventRow[] = [];

  try {
    const resolvedWindow = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    [activeRows, resolvedRows, eventRows] = await Promise.all([
      prisma.$queryRaw<IncidentRow[]>`
        SELECT "id", "severity", "status", "title", "startedAt", "resolvedAt", "updatedAt"
        FROM "OperationalIncident"
        WHERE "source" = 'RPC_HEALTH'::"IncidentSource" AND "status" = 'ACTIVE'::"IncidentStatus"
        ORDER BY "updatedAt" DESC
        LIMIT 20
      `,
      prisma.$queryRaw<IncidentRow[]>`
        SELECT "id", "severity", "status", "title", "startedAt", "resolvedAt", "updatedAt"
        FROM "OperationalIncident"
        WHERE "source" = 'RPC_HEALTH'::"IncidentSource" AND "status" = 'RESOLVED'::"IncidentStatus" AND "resolvedAt" >= ${resolvedWindow}
        ORDER BY "resolvedAt" DESC
        LIMIT 20
      `,
      prisma.$queryRaw<LatestEventRow[]>`
        SELECT DISTINCT ON (e."incidentId")
          e."incidentId" as "incidentId",
          e."eventType" as "eventType",
          e."createdAt" as "createdAt"
        FROM "OperationalIncidentEvent" e
        INNER JOIN "OperationalIncident" i ON i."id" = e."incidentId"
        WHERE i."source" = 'RPC_HEALTH'::"IncidentSource"
        ORDER BY e."incidentId", e."createdAt" DESC
      `,
    ]);
  } catch (err) {
    if (!isMissingRelationError(err)) throw err;
  }

  const eventMap = new Map(eventRows.map((row) => [row.incidentId, row]));
  const activeIncidents = activeRows.map((row) => toPublicIncident(row, eventMap.get(row.id)?.eventType ?? null));
  const resolvedIncidents = resolvedRows.map((row) => toPublicIncident(row, eventMap.get(row.id)?.eventType ?? null));

  const systemStatus = deriveSystemStatus(maintenance.enabled, activeRows);

  const lastUpdatedCandidates: Date[] = [
    maintenance.updatedAt instanceof Date ? maintenance.updatedAt : new Date(maintenance.updatedAt),
    ...activeIncidents.map((incident) => incident.updatedAt),
    ...resolvedIncidents.map((incident) => incident.updatedAt),
  ];

  const lastUpdated = new Date(Math.max(...lastUpdatedCandidates.map((date) => date.getTime())));

  return {
    systemStatus,
    lastUpdated,
    maintenance: {
      enabled: maintenance.enabled,
      message: maintenance.message,
      maintenanceEndsAt: maintenance.maintenanceEndsAt ? new Date(maintenance.maintenanceEndsAt) : null,
    },
    affectedComponents: buildComponentStatuses(systemStatus, maintenance.enabled, activeIncidents.length > 0),
    activeIncidents,
    resolvedIncidents,
  };
}
