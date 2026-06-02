import { NextResponse } from "next/server";
import { getObservabilityMetricsSnapshot } from "@/lib/observability";

export async function GET() {
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    metrics: getObservabilityMetricsSnapshot(),
  });
}
