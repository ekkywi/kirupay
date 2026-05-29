type Severity = "info" | "warn" | "error";
type Outcome = "success" | "error";
type LogLevel = Severity;

type MetricBucket = {
  requests: number;
  errors: number;
  totalDurationMs: number;
};

type ErrorCounterKey = `${string}:${string}`;

type EventPayload = {
  event: string;
  severity: Severity;
  requestId: string;
  target: string;
  outcome: Outcome;
  status?: number;
  durationMs: number;
  errorCode?: string;
  details?: Record<string, unknown>;
};

type TimerContext = {
  requestId: string;
  target: string;
  startedAt: number;
};

const METRIC_STATE = {
  byTarget: new Map<string, MetricBucket>(),
  errorsByCode: new Map<ErrorCounterKey, number>(),
};

const LOG_LEVEL_PRIORITY: Record<Severity, number> = {
  info: 1,
  warn: 2,
  error: 3,
};

const TARGET_INFO_SAMPLE_RATE: Partial<Record<string, number>> = {
  "POST /api/internal/rpc-telemetry": 0.01,
};

function ensureBucket(target: string) {
  const existing = METRIC_STATE.byTarget.get(target);
  if (existing) return existing;

  const next: MetricBucket = { requests: 0, errors: 0, totalDurationMs: 0 };
  METRIC_STATE.byTarget.set(target, next);
  return next;
}

function bumpErrorCounter(target: string, errorCode: string) {
  const key: ErrorCounterKey = `${target}:${errorCode}`;
  METRIC_STATE.errorsByCode.set(key, (METRIC_STATE.errorsByCode.get(key) ?? 0) + 1);
}

function toLatencyBucket(durationMs: number) {
  if (durationMs < 50) return "lt50ms";
  if (durationMs < 200) return "50to199ms";
  if (durationMs < 1000) return "200to999ms";
  return "gte1000ms";
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
}

function toNumberInRange(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function resolveLogLevel(isProduction: boolean): LogLevel {
  const raw = process.env.OBS_LOG_LEVEL?.trim().toLowerCase();
  if (raw === "error" || raw === "warn" || raw === "info") return raw;
  return isProduction ? "warn" : "info";
}

function shouldLogByLevel(level: Severity, minLevel: LogLevel) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

function sanitizeDetails(details: Record<string, unknown> | undefined, isProduction: boolean) {
  if (!details) return undefined;
  const includeDetailsInProd = toBoolean(process.env.OBS_DETAILS_IN_PROD, false);
  if (!isProduction || includeDetailsInProd) return details;
  return undefined;
}

function shouldSampleInfo(target: string, isProduction: boolean) {
  if (!isProduction) return true;
  const globalSampleRate = toNumberInRange(process.env.OBS_INFO_SAMPLE_RATE, 0.05, 0, 1);
  const targetRate = TARGET_INFO_SAMPLE_RATE[target];
  const sampleRate = typeof targetRate === "number" ? targetRate : globalSampleRate;
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  return Math.random() < sampleRate;
}

export function startObservation(requestId: string, target: string): TimerContext {
  return {
    requestId,
    target,
    startedAt: Date.now(),
  };
}

export function recordObservation(
  ctx: TimerContext,
  input: {
    event?: string;
    outcome: Outcome;
    severity?: Severity;
    status?: number;
    errorCode?: string;
    details?: Record<string, unknown>;
  },
) {
  const durationMs = Date.now() - ctx.startedAt;
  const event = input.event ?? "api.request";
  const isProduction = process.env.NODE_ENV === "production";
  const slowWarnLatencyMs = toNumberInRange(process.env.OBS_WARN_LATENCY_MS, 1000, 1, 60_000);

  const baseSeverity: Severity = input.severity ?? (input.outcome === "error" ? "error" : "info");
  const severity: Severity =
    input.outcome === "success" && baseSeverity === "info" && durationMs >= slowWarnLatencyMs
      ? "warn"
      : baseSeverity;

  const bucket = ensureBucket(ctx.target);
  bucket.requests += 1;
  bucket.totalDurationMs += durationMs;

  if (input.outcome === "error") {
    bucket.errors += 1;
    if (input.errorCode) bumpErrorCounter(ctx.target, input.errorCode);
  }

  const payload: EventPayload = {
    event,
    severity,
    requestId: ctx.requestId,
    target: ctx.target,
    outcome: input.outcome,
    status: input.status,
    durationMs,
    errorCode: input.errorCode,
    details: sanitizeDetails(input.details, isProduction),
  };

  const minLevel = resolveLogLevel(isProduction);
  const infoEnabledInProd = toBoolean(process.env.OBS_INFO_ENABLED_IN_PROD, false);
  if (!shouldLogByLevel(severity, minLevel)) return;
  if (isProduction && severity === "info" && !infoEnabledInProd) return;
  if (severity === "info" && !shouldSampleInfo(ctx.target, isProduction)) return;

  const logMethod = severity === "error" ? console.error : severity === "warn" ? console.warn : console.info;
  logMethod("[obs]", {
    ...payload,
    latencyBucket: toLatencyBucket(durationMs),
  });
}

export function getObservabilityMetricsSnapshot() {
  return {
    byTarget: Array.from(METRIC_STATE.byTarget.entries()).map(([target, value]) => ({
      target,
      requests: value.requests,
      errors: value.errors,
      avgDurationMs: value.requests > 0 ? Number((value.totalDurationMs / value.requests).toFixed(2)) : 0,
    })),
    errorsByCode: Array.from(METRIC_STATE.errorsByCode.entries()).map(([key, value]) => {
      const [target, code] = key.split(":");
      return { target, code, count: value };
    }),
  };
}

export function resetObservabilityMetricsForTest() {
  METRIC_STATE.byTarget.clear();
  METRIC_STATE.errorsByCode.clear();
}
