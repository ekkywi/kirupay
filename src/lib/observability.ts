type Severity = "info" | "warn" | "error";
type Outcome = "success" | "error";

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
  const severity: Severity = input.severity ?? (input.outcome === "error" ? "error" : "info");

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
    details: input.details,
  };

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
