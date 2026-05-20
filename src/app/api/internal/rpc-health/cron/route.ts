import { NextResponse } from "next/server";
import { getRpcHealthSummary, runRpcHealthChecks } from "@/lib/rpc-health";

function isAuthorized(req: Request) {
  const configured = process.env.RPC_HEALTH_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!configured) return true;
  const secretHeader = req.headers.get("x-cron-secret")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  return Boolean((secretHeader && secretHeader === configured) || (bearer && bearer === configured));
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const probe = await runRpcHealthChecks();
  const summary = await getRpcHealthSummary();

  return NextResponse.json({
    ok: probe.ok,
    error: probe.error,
    checkedEndpoints: probe.results.length,
    rateLimitAlert: summary.rateLimitAlert,
    oneHour: {
      totalChecks: summary.oneHour.totalChecks,
      rateLimitedCount: summary.oneHour.rateLimitedCount,
      rateLimitedRate: summary.oneHour.rateLimitedRate,
    },
    checkedAt: new Date().toISOString(),
  });
}
