import prisma from "@/lib/neon";
import crypto from "crypto";
import { getRpcTrafficSummary, type RpcTrafficSummary } from "@/lib/rpc-traffic";

export type RpcHealthStatus = "HEALTHY" | "DEGRADED" | "DOWN";
export type RpcEndpointType = "PRIMARY" | "FALLBACK";
export type IncidentSource = "RPC_HEALTH";
export type IncidentSeverity = "WARNING" | "CRITICAL";
export type IncidentStatus = "ACTIVE" | "RESOLVED";
export type IncidentEventType = "CREATED" | "UPDATED" | "RESOLVED";

export type RpcHealthSnapshot = {
  id?: string;
  endpointType: RpcEndpointType;
  endpointUrlMasked: string;
  latencyMs: number | null;
  isReachable: boolean;
  httpStatus: number | null;
  errorType: string | null;
  status: RpcHealthStatus;
  checkedAt: Date;
};

export type RpcHealthWindowSummary = {
  totalChecks: number;
  successRate: number;
  p95LatencyMs: number | null;
  downtimeCount: number;
  degradedCount: number;
  rateLimitedCount: number;
  rateLimitedRate: number;
};

export type RpcHealthSummary = {
  latestPrimary: RpcHealthSnapshot | null;
  latestFallback: RpcHealthSnapshot | null;
  oneHour: RpcHealthWindowSummary;
  twentyFourHours: RpcHealthWindowSummary;
  recentIncidents: RpcHealthSnapshot[];
  rateLimitAlert: {
    level: "OK" | "WARNING" | "CRITICAL";
    message: string;
  };
  activeIncidents: IncidentView[];
  resolvedIncidents: IncidentView[];
  incidentTimeline: IncidentEventView[];
  traffic: RpcTrafficSummary;
  configError: string | null;
};

export type IncidentView = {
  id: string;
  source: IncidentSource;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  summary: string;
  startedAt: Date;
  resolvedAt: Date | null;
  lastObservedAt: Date;
};

export type IncidentEventView = {
  id: string;
  incidentId: string;
  incidentTitle: string;
  incidentSeverity: IncidentSeverity;
  incidentStatus: IncidentStatus;
  eventType: IncidentEventType;
  message: string;
  createdAt: Date;
};

type ProbeInput = {
  endpointType: RpcEndpointType;
  endpointUrl: string;
};

type ProbeResult = RpcHealthSnapshot;

type RpcHealthLogRow = {
  id: string;
  endpointType: RpcEndpointType;
  endpointUrlMasked: string;
  latencyMs: number | null;
  isReachable: boolean;
  httpStatus: number | null;
  errorType: string | null;
  status: RpcHealthStatus;
  checkedAt: Date | string;
  createdAt: Date | string;
};

type OperationalIncidentRow = {
  id: string;
  source: IncidentSource;
  severity: IncidentSeverity;
  status: IncidentStatus;
  dedupKey: string;
  title: string;
  summary: string;
  startedAt: Date | string;
  resolvedAt: Date | string | null;
  lastObservedAt: Date | string;
  healthyStreak: number;
};

type IncidentTimelineRow = {
  eventId: string;
  incidentId: string;
  incidentTitle: string;
  incidentSeverity: IncidentSeverity;
  incidentStatus: IncidentStatus;
  eventType: IncidentEventType;
  message: string;
  createdAt: Date | string;
};

type RpcHealthLogModelDelegate = {
  createMany: (args: {
    data: Array<{
      endpointType: RpcEndpointType;
      endpointUrlMasked: string;
      latencyMs: number | null;
      isReachable: boolean;
      httpStatus: number | null;
      errorType: string | null;
      status: RpcHealthStatus;
      checkedAt: Date;
    }>;
  }) => Promise<unknown>;
  findFirst: (args: {
    where: { endpointType: RpcEndpointType };
    orderBy: { checkedAt: "desc" };
  }) => Promise<RpcHealthLogRow | null>;
  findMany: (args: {
    where?: {
      checkedAt?: { gte: Date };
      status?: { not: RpcHealthStatus };
    };
    select?: { status: true; latencyMs: true; httpStatus: true };
    orderBy: { checkedAt: "desc" };
    take?: number;
  }) => Promise<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }> | RpcHealthLogRow[]>;
};

type PrismaWithOptionalRpcHealth = typeof prisma & {
  rpcHealthLog?: RpcHealthLogModelDelegate;
};

const DEFAULT_WARN_MS = 1200;
const DEFAULT_DOWN_MS = 5000;
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RATE_LIMIT_WARN_PERCENT = 5;
const DEFAULT_RATE_LIMIT_CRITICAL_PERCENT = 15;
const INCIDENT_SOURCE: IncidentSource = "RPC_HEALTH";

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getThresholds() {
  const warnMs = parsePositiveInt(process.env.RPC_LATENCY_WARN_MS, DEFAULT_WARN_MS);
  const downMs = parsePositiveInt(process.env.RPC_LATENCY_DOWN_MS, DEFAULT_DOWN_MS);
  return {
    warnMs: Math.min(warnMs, downMs),
    downMs: Math.max(warnMs, downMs),
    timeoutMs: parsePositiveInt(process.env.RPC_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  };
}

function getRateLimitThresholds() {
  const warn = parsePositiveInt(process.env.RPC_RATE_LIMIT_WARN_PERCENT, DEFAULT_RATE_LIMIT_WARN_PERCENT);
  const critical = parsePositiveInt(process.env.RPC_RATE_LIMIT_CRITICAL_PERCENT, DEFAULT_RATE_LIMIT_CRITICAL_PERCENT);
  return {
    warn: Math.min(warn, critical),
    critical: Math.max(warn, critical),
  };
}

function maskEndpoint(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch {
    return "invalid-endpoint";
  }
}

function statusFromProbe(isReachable: boolean, latencyMs: number | null, warnMs: number, downMs: number): RpcHealthStatus {
  if (!isReachable) return "DOWN";
  if (latencyMs === null) return "DOWN";
  if (latencyMs >= downMs) return "DOWN";
  if (latencyMs >= warnMs) return "DEGRADED";
  return "HEALTHY";
}

function isMissingRelationError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const maybe = err as { code?: string; message?: string };
  return maybe.code === "42P01" || (typeof maybe.message === "string" && maybe.message.includes("does not exist"));
}

function isMissingPrismaAccessorError(err: unknown) {
  return err instanceof TypeError && err.message.includes("undefined");
}

function getClusterDefaultRpc(cluster: string | undefined) {
  if (cluster === "mainnet-beta") return "https://api.mainnet-beta.solana.com";
  if (cluster === "testnet") return "https://api.testnet.solana.com";
  return "https://api.devnet.solana.com";
}

function resolvePrimaryRpc() {
  const configuredPrimary = process.env.SOLANA_RPC_PRIMARY?.trim();
  if (configuredPrimary) {
    return {
      endpoint: configuredPrimary,
      derivedFromCluster: false,
      source: "SOLANA_RPC_PRIMARY",
    } as const;
  }

  const cluster = process.env.SOLANA_CLUSTER?.trim();
  return {
    endpoint: getClusterDefaultRpc(cluster),
    derivedFromCluster: true,
    source: "CLUSTER_DEFAULT",
  } as const;
}

function mapRowToSnapshot(row: RpcHealthLogRow): RpcHealthSnapshot {
  return {
    id: row.id,
    endpointType: row.endpointType,
    endpointUrlMasked: row.endpointUrlMasked,
    latencyMs: row.latencyMs,
    isReachable: row.isReachable,
    httpStatus: row.httpStatus,
    errorType: row.errorType,
    status: row.status,
    checkedAt: new Date(row.checkedAt),
  };
}

function mapIncidentRow(row: OperationalIncidentRow): IncidentView {
  return {
    id: row.id,
    source: row.source,
    severity: row.severity,
    status: row.status,
    title: row.title,
    summary: row.summary,
    startedAt: new Date(row.startedAt),
    resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
    lastObservedAt: new Date(row.lastObservedAt),
  };
}

function mapIncidentTimelineRow(row: IncidentTimelineRow): IncidentEventView {
  return {
    id: row.eventId,
    incidentId: row.incidentId,
    incidentTitle: row.incidentTitle,
    incidentSeverity: row.incidentSeverity,
    incidentStatus: row.incidentStatus,
    eventType: row.eventType,
    message: row.message,
    createdAt: new Date(row.createdAt),
  };
}

function deriveIncidentSignal(results: ProbeResult[], rateLimitLevel: "OK" | "WARNING" | "CRITICAL") {
  const downCount = results.filter((result) => result.status === "DOWN").length;
  const degradedCount = results.filter((result) => result.status === "DEGRADED").length;
  const hasBothDegraded = results.length >= 2 && degradedCount === results.length;
  const hasDown = downCount > 0;
  const isRateLimitCritical = rateLimitLevel === "CRITICAL";
  const triggerActive = hasDown || isRateLimitCritical || hasBothDegraded;

  if (!triggerActive) return null;

  const dominantSymptom = hasDown ? "DOWN" : isRateLimitCritical ? "RATE_LIMIT_CRITICAL" : "DEGRADED_BOTH";
  const scope = results.some((result) => result.endpointType === "FALLBACK") ? "DUAL_ENDPOINT" : "PRIMARY_ONLY";
  const dedupKey = `${INCIDENT_SOURCE}:${dominantSymptom}:${scope}`;
  const severity: IncidentSeverity = hasDown || isRateLimitCritical ? "CRITICAL" : "WARNING";
  const title =
    dominantSymptom === "DOWN"
      ? "RPC endpoint outage detected"
      : dominantSymptom === "RATE_LIMIT_CRITICAL"
        ? "RPC rate-limit pressure is critical"
        : "RPC performance degradation detected";
  const summary = `Signal=${dominantSymptom}; down=${downCount}; degraded=${degradedCount}; rateLimit=${rateLimitLevel}.`;

  return { dedupKey, severity, title, summary };
}

async function createIncidentEvent(incidentId: string, eventType: IncidentEventType, message: string) {
  const eventId = crypto.randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "OperationalIncidentEvent" ("id", "incidentId", "eventType", "message", "createdAt")
    VALUES (${eventId}, ${incidentId}, ${eventType}::"IncidentEventType", ${message}, now())
  `;
}

async function processRpcIncidentLifecycle(
  results: ProbeResult[],
  rateLimitLevel: "OK" | "WARNING" | "CRITICAL",
  primaryEndpointMasked: string,
  fallbackEndpointMasked: string | null,
) {
  const now = new Date();
  const signal = deriveIncidentSignal(results, rateLimitLevel);
  const activeIncidents = await prisma.$queryRaw<OperationalIncidentRow[]>`
    SELECT * FROM "OperationalIncident"
    WHERE "source" = ${INCIDENT_SOURCE}::"IncidentSource" AND "status" = 'ACTIVE'
    ORDER BY "lastObservedAt" DESC
  `;

  if (signal) {
    const matching = activeIncidents.find((incident) => incident.dedupKey === signal.dedupKey) ?? null;
    if (matching) {
      await prisma.$executeRaw`
        UPDATE "OperationalIncident"
        SET "severity" = ${signal.severity}::"IncidentSeverity",
            "title" = ${signal.title},
            "summary" = ${signal.summary},
            "lastObservedAt" = ${now},
            "healthyStreak" = 0,
            "primaryEndpointMasked" = ${primaryEndpointMasked},
            "fallbackEndpointMasked" = ${fallbackEndpointMasked},
            "updatedAt" = now()
        WHERE "id" = ${matching.id}
      `;
      await createIncidentEvent(matching.id, "UPDATED", `Disruption still active (${signal.summary})`);
    } else {
      const newId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "OperationalIncident"
        ("id", "source", "severity", "status", "dedupKey", "title", "summary", "startedAt", "lastObservedAt", "healthyStreak", "primaryEndpointMasked", "fallbackEndpointMasked", "createdAt", "updatedAt")
        VALUES
        (${newId}, ${INCIDENT_SOURCE}::"IncidentSource", ${signal.severity}::"IncidentSeverity", 'ACTIVE'::"IncidentStatus", ${signal.dedupKey}, ${signal.title}, ${signal.summary}, ${now}, ${now}, 0, ${primaryEndpointMasked}, ${fallbackEndpointMasked}, now(), now())
      `;
      await createIncidentEvent(newId, "CREATED", `New disruption detected (${signal.summary})`);
    }

    const superseded = activeIncidents.filter((incident) => incident.dedupKey !== signal.dedupKey);
    for (const oldIncident of superseded) {
      await prisma.$executeRaw`
        UPDATE "OperationalIncident"
        SET "status" = 'RESOLVED'::"IncidentStatus",
            "resolvedAt" = ${now},
            "lastObservedAt" = ${now},
            "updatedAt" = now()
        WHERE "id" = ${oldIncident.id}
      `;
      await createIncidentEvent(oldIncident.id, "RESOLVED", "Disruption resolved (superseded by a new signal).");
    }
    return;
  }

  for (const incident of activeIncidents) {
    const nextStreak = (incident.healthyStreak ?? 0) + 1;
    if (nextStreak >= 2) {
      await prisma.$executeRaw`
        UPDATE "OperationalIncident"
        SET "status" = 'RESOLVED'::"IncidentStatus",
            "resolvedAt" = ${now},
            "lastObservedAt" = ${now},
            "healthyStreak" = ${nextStreak},
            "updatedAt" = now()
        WHERE "id" = ${incident.id}
      `;
      await createIncidentEvent(incident.id, "RESOLVED", "Disruption resolved after two consecutive healthy checks.");
    } else {
      await prisma.$executeRaw`
        UPDATE "OperationalIncident"
        SET "healthyStreak" = ${nextStreak},
            "lastObservedAt" = ${now},
            "updatedAt" = now()
        WHERE "id" = ${incident.id}
      `;
      await createIncidentEvent(incident.id, "UPDATED", "Healthy check observed while monitoring for recovery.");
    }
  }
}

async function getIncidentSummary() {
  try {
    const [activeRows, resolvedRows, timelineRows] = await Promise.all([
      prisma.$queryRaw<OperationalIncidentRow[]>`
        SELECT * FROM "OperationalIncident"
        WHERE "source" = ${INCIDENT_SOURCE}::"IncidentSource" AND "status" = 'ACTIVE'
        ORDER BY "lastObservedAt" DESC
        LIMIT 5
      `,
      prisma.$queryRaw<OperationalIncidentRow[]>`
        SELECT * FROM "OperationalIncident"
        WHERE "source" = ${INCIDENT_SOURCE}::"IncidentSource" AND "status" = 'RESOLVED'
        ORDER BY "resolvedAt" DESC NULLS LAST
        LIMIT 20
      `,
      prisma.$queryRaw<IncidentTimelineRow[]>`
        SELECT
          e."id" as "eventId",
          e."incidentId" as "incidentId",
          i."title" as "incidentTitle",
          i."severity" as "incidentSeverity",
          i."status" as "incidentStatus",
          e."eventType" as "eventType",
          e."message" as "message",
          e."createdAt" as "createdAt"
        FROM "OperationalIncidentEvent" e
        INNER JOIN "OperationalIncident" i ON i."id" = e."incidentId"
        WHERE i."source" = ${INCIDENT_SOURCE}::"IncidentSource"
        ORDER BY e."createdAt" DESC
        LIMIT 30
      `,
    ]);

    return {
      activeIncidents: activeRows.map(mapIncidentRow),
      resolvedIncidents: resolvedRows.map(mapIncidentRow),
      incidentTimeline: timelineRows.map(mapIncidentTimelineRow),
    };
  } catch (err) {
    if (isMissingRelationError(err)) {
      return {
        activeIncidents: [] as IncidentView[],
        resolvedIncidents: [] as IncidentView[],
        incidentTimeline: [] as IncidentEventView[],
      };
    }
    throw err;
  }
}

async function probeEndpoint({ endpointType, endpointUrl }: ProbeInput): Promise<ProbeResult> {
  const { warnMs, downMs, timeoutMs } = getThresholds();
  const checkedAt = new Date();
  const start = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth", params: [] }),
      signal: controller.signal,
      cache: "no-store",
    });

    const latencyMs = Date.now() - start;
    const body = (await response.json().catch(() => null)) as { error?: { code?: number } } | null;
    const hasRpcError = Boolean(body?.error);
    const isRateLimited = response.status === 429;
    const isReachable = response.ok && !hasRpcError;
    const status = statusFromProbe(isReachable, latencyMs, warnMs, downMs);

    return {
      endpointType,
      endpointUrlMasked: maskEndpoint(endpointUrl),
      latencyMs,
      isReachable,
      httpStatus: response.status,
      errorType: isRateLimited ? "RATE_LIMITED" : hasRpcError ? "RPC_ERROR" : null,
      status,
      checkedAt,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const errorType = err instanceof Error && err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
    return {
      endpointType,
      endpointUrlMasked: maskEndpoint(endpointUrl),
      latencyMs,
      isReachable: false,
      httpStatus: null,
      errorType,
      status: "DOWN",
      checkedAt,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function persistProbeResults(results: ProbeResult[]) {
  if (results.length === 0) return;

  const client = prisma as PrismaWithOptionalRpcHealth;
  const data = results.map((result) => ({
    endpointType: result.endpointType,
    endpointUrlMasked: result.endpointUrlMasked,
    latencyMs: result.latencyMs,
    isReachable: result.isReachable,
    httpStatus: result.httpStatus,
    errorType: result.errorType,
    status: result.status,
    checkedAt: result.checkedAt,
  }));

  try {
    if (client.rpcHealthLog && typeof client.rpcHealthLog.createMany === "function") {
      await client.rpcHealthLog.createMany({ data });
      return;
    }
  } catch (err) {
    if (!isMissingRelationError(err) && !isMissingPrismaAccessorError(err)) {
      throw err;
    }
  }

  for (const row of data) {
    const generatedId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "RpcHealthLog"
      ("id", "endpointType", "endpointUrlMasked", "latencyMs", "isReachable", "httpStatus", "errorType", "status", "checkedAt", "createdAt")
      VALUES
      (${generatedId}, ${row.endpointType}::"RpcEndpointType", ${row.endpointUrlMasked}, ${row.latencyMs}, ${row.isReachable}, ${row.httpStatus}, ${row.errorType}, ${row.status}::"RpcHealthStatus", ${row.checkedAt}, now())
    `;
  }
}

export async function runRpcHealthChecks() {
  const primaryResolved = resolvePrimaryRpc();
  const primary = primaryResolved.endpoint;
  const fallback = process.env.SOLANA_RPC_FALLBACK?.trim();

  const targets: ProbeInput[] = [{ endpointType: "PRIMARY", endpointUrl: primary }];
  if (fallback) {
    targets.push({ endpointType: "FALLBACK", endpointUrl: fallback });
  }

  const results = await Promise.all(targets.map((target) => probeEndpoint(target)));

  try {
    await persistProbeResults(results);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourLogs = await prisma.$queryRaw<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>>`
      SELECT "status", "latencyMs", "httpStatus" FROM "RpcHealthLog" WHERE "checkedAt" >= ${oneHourAgo} ORDER BY "checkedAt" DESC
    `;
    const rateLimitLevel = buildRateLimitAlert(calculateWindowSummary(oneHourLogs)).level;
    try {
      await processRpcIncidentLifecycle(results, rateLimitLevel, maskEndpoint(primary), fallback ? maskEndpoint(fallback) : null);
    } catch (incidentErr) {
      if (!isMissingRelationError(incidentErr)) throw incidentErr;
    }
    return {
      ok: true as const,
      error: primaryResolved.derivedFromCluster
        ? "SOLANA_RPC_PRIMARY is not configured. Using cluster default RPC endpoint."
        : null,
      results,
    };
  } catch (err) {
    if (isMissingRelationError(err)) {
      return {
        ok: false as const,
        error: "RpcHealthLog table is not available yet. Run database migrations first.",
        results,
      };
    }

    const message = err instanceof Error ? err.message : "Failed to persist RPC health logs.";
    return { ok: false as const, error: message, results };
  }
}

function calculateWindowSummary(logs: Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>): RpcHealthWindowSummary {
  if (logs.length === 0) {
    return { totalChecks: 0, successRate: 0, p95LatencyMs: null, downtimeCount: 0, degradedCount: 0, rateLimitedCount: 0, rateLimitedRate: 0 };
  }

  const reachable = logs.filter((log) => log.status !== "DOWN").length;
  const latencies = logs
    .map((log) => log.latencyMs)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);

  const p95LatencyMs =
    latencies.length === 0 ? null : latencies[Math.min(latencies.length - 1, Math.floor(0.95 * (latencies.length - 1)))];

  return {
    totalChecks: logs.length,
    successRate: (reachable / logs.length) * 100,
    p95LatencyMs,
    downtimeCount: logs.filter((log) => log.status === "DOWN").length,
    degradedCount: logs.filter((log) => log.status === "DEGRADED").length,
    rateLimitedCount: logs.filter((log) => log.httpStatus === 429).length,
    rateLimitedRate: (logs.filter((log) => log.httpStatus === 429).length / logs.length) * 100,
  };
}

function buildRateLimitAlert(oneHour: RpcHealthWindowSummary) {
  const thresholds = getRateLimitThresholds();
  if (oneHour.totalChecks === 0) {
    return {
      level: "OK" as const,
      message: "No health checks recorded yet.",
    };
  }

  if (oneHour.rateLimitedRate >= thresholds.critical) {
    return {
      level: "CRITICAL" as const,
      message: `Rate limit is critical (${oneHour.rateLimitedRate.toFixed(1)}% in 1h). Consider failover or traffic shaping.`,
    };
  }

  if (oneHour.rateLimitedRate >= thresholds.warn) {
    return {
      level: "WARNING" as const,
      message: `Rate limit warning (${oneHour.rateLimitedRate.toFixed(1)}% in 1h). Monitor and prepare fallback.`,
    };
  }

  return {
    level: "OK" as const,
    message: `Rate limit healthy (${oneHour.rateLimitedRate.toFixed(1)}% in 1h).`,
  };
}

export async function getRpcHealthSummary(): Promise<RpcHealthSummary> {
  const primaryResolved = resolvePrimaryRpc();
  const configError = primaryResolved.derivedFromCluster
    ? `SOLANA_RPC_PRIMARY is not configured. Using cluster default (${primaryResolved.endpoint}).`
    : null;

  const client = prisma as PrismaWithOptionalRpcHealth;

  try {
    const now = Date.now();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    if (client.rpcHealthLog && typeof client.rpcHealthLog.findFirst === "function") {
      const [latestPrimary, latestFallback, oneHourLogs, twentyFourHoursLogs, recentIncidents, traffic, incidentSummary] = await Promise.all([
        client.rpcHealthLog.findFirst({ where: { endpointType: "PRIMARY" }, orderBy: { checkedAt: "desc" } }),
        client.rpcHealthLog.findFirst({ where: { endpointType: "FALLBACK" }, orderBy: { checkedAt: "desc" } }),
        client.rpcHealthLog.findMany({
          where: { checkedAt: { gte: oneHourAgo } },
          select: { status: true, latencyMs: true, httpStatus: true },
          orderBy: { checkedAt: "desc" },
        }) as Promise<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>>,
        client.rpcHealthLog.findMany({
          where: { checkedAt: { gte: twentyFourHoursAgo } },
          select: { status: true, latencyMs: true, httpStatus: true },
          orderBy: { checkedAt: "desc" },
        }) as Promise<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>>,
        client.rpcHealthLog.findMany({
          where: { status: { not: "HEALTHY" } },
          orderBy: { checkedAt: "desc" },
          take: 8,
        }) as Promise<RpcHealthLogRow[]>,
        getRpcTrafficSummary(),
        getIncidentSummary(),
      ]);

      return {
        latestPrimary: latestPrimary ? mapRowToSnapshot(latestPrimary) : null,
        latestFallback: latestFallback ? mapRowToSnapshot(latestFallback) : null,
        oneHour: calculateWindowSummary(oneHourLogs),
        twentyFourHours: calculateWindowSummary(twentyFourHoursLogs),
        recentIncidents: recentIncidents.map(mapRowToSnapshot),
        rateLimitAlert: buildRateLimitAlert(calculateWindowSummary(oneHourLogs)),
        activeIncidents: incidentSummary.activeIncidents,
        resolvedIncidents: incidentSummary.resolvedIncidents,
        incidentTimeline: incidentSummary.incidentTimeline,
        traffic,
        configError,
      };
    }

    const [latestPrimaryRows, latestFallbackRows, oneHourLogs, twentyFourHoursLogs, incidentRows, traffic, incidentSummary] = await Promise.all([
      prisma.$queryRaw<RpcHealthLogRow[]>`
        SELECT * FROM "RpcHealthLog" WHERE "endpointType" = 'PRIMARY' ORDER BY "checkedAt" DESC LIMIT 1
      `,
      prisma.$queryRaw<RpcHealthLogRow[]>`
        SELECT * FROM "RpcHealthLog" WHERE "endpointType" = 'FALLBACK' ORDER BY "checkedAt" DESC LIMIT 1
      `,
      prisma.$queryRaw<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>>`
        SELECT "status", "latencyMs", "httpStatus" FROM "RpcHealthLog" WHERE "checkedAt" >= ${oneHourAgo} ORDER BY "checkedAt" DESC
      `,
      prisma.$queryRaw<Array<{ status: RpcHealthStatus; latencyMs: number | null; httpStatus: number | null }>>`
        SELECT "status", "latencyMs", "httpStatus" FROM "RpcHealthLog" WHERE "checkedAt" >= ${twentyFourHoursAgo} ORDER BY "checkedAt" DESC
      `,
      prisma.$queryRaw<RpcHealthLogRow[]>`
        SELECT * FROM "RpcHealthLog" WHERE "status" <> 'HEALTHY' ORDER BY "checkedAt" DESC LIMIT 8
      `,
      getRpcTrafficSummary(),
      getIncidentSummary(),
    ]);

    const oneHourSummary = calculateWindowSummary(oneHourLogs);
    const twentyFourHourSummary = calculateWindowSummary(twentyFourHoursLogs);

    return {
      latestPrimary: latestPrimaryRows[0] ? mapRowToSnapshot(latestPrimaryRows[0]) : null,
      latestFallback: latestFallbackRows[0] ? mapRowToSnapshot(latestFallbackRows[0]) : null,
      oneHour: oneHourSummary,
      twentyFourHours: twentyFourHourSummary,
      recentIncidents: incidentRows.map(mapRowToSnapshot),
      rateLimitAlert: buildRateLimitAlert(oneHourSummary),
      activeIncidents: incidentSummary.activeIncidents,
      resolvedIncidents: incidentSummary.resolvedIncidents,
      incidentTimeline: incidentSummary.incidentTimeline,
      traffic,
      configError,
    };
  } catch (err) {
    if (isMissingRelationError(err)) {
      return {
        latestPrimary: null,
        latestFallback: null,
        oneHour: { totalChecks: 0, successRate: 0, p95LatencyMs: null, downtimeCount: 0, degradedCount: 0, rateLimitedCount: 0, rateLimitedRate: 0 },
        twentyFourHours: { totalChecks: 0, successRate: 0, p95LatencyMs: null, downtimeCount: 0, degradedCount: 0, rateLimitedCount: 0, rateLimitedRate: 0 },
        recentIncidents: [],
        rateLimitAlert: { level: "OK", message: "No health checks recorded yet." },
        activeIncidents: [],
        resolvedIncidents: [],
        incidentTimeline: [],
        traffic: await getRpcTrafficSummary(),
        configError: "RpcHealthLog table is not available yet. Run database migrations first.",
      };
    }

    return {
      latestPrimary: null,
      latestFallback: null,
      oneHour: { totalChecks: 0, successRate: 0, p95LatencyMs: null, downtimeCount: 0, degradedCount: 0, rateLimitedCount: 0, rateLimitedRate: 0 },
      twentyFourHours: { totalChecks: 0, successRate: 0, p95LatencyMs: null, downtimeCount: 0, degradedCount: 0, rateLimitedCount: 0, rateLimitedRate: 0 },
      recentIncidents: [],
      rateLimitAlert: { level: "OK", message: "No health checks recorded yet." },
      activeIncidents: [],
      resolvedIncidents: [],
      incidentTimeline: [],
      traffic: await getRpcTrafficSummary(),
      configError: err instanceof Error ? err.message : "Failed to load RPC health summary.",
    };
  }
}
