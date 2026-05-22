import { NextResponse } from "next/server";
import { apiError, createRequestId } from "@/lib/api-errors";
import { evaluatePaymentLifecycle } from "@/lib/payment-lifecycle";

function isAuthorized(req: Request) {
  const configured = process.env.PAYMENT_LIFECYCLE_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!configured) return true;
  const secretHeader = req.headers.get("x-cron-secret")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  return Boolean((secretHeader && secretHeader === configured) || (bearer && bearer === configured));
}

export async function GET(req: Request) {
  const requestId = createRequestId();

  if (!isAuthorized(req)) {
    return apiError(401, {
      code: "INTERNAL_CRON_UNAUTHORIZED",
      message: "Unauthorized cron access.",
      requestId,
      retryable: false,
    });
  }

  const result = await evaluatePaymentLifecycle();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
