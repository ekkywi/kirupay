import { NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";
import { getOrCreateNotificationPreferences, NOTIFICATION_PREF_DEFAULTS } from "@/lib/merchant-notifications";
import prisma from "@/lib/neon";

export async function GET() {
  const requestId = createRequestId();

  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const preference = await getOrCreateNotificationPreferences(merchant.id);
    return NextResponse.json({ success: true, data: preference });
  } catch (error) {
    console.error("Fetch notification preferences error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const body = (await req.json()) as Partial<typeof NOTIFICATION_PREF_DEFAULTS>;
    const updates: Partial<typeof NOTIFICATION_PREF_DEFAULTS> = {};

    for (const key of Object.keys(NOTIFICATION_PREF_DEFAULTS) as Array<keyof typeof NOTIFICATION_PREF_DEFAULTS>) {
      if (typeof body[key] === "boolean") {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "No valid notification preferences provided.",
        requestId,
        retryable: false,
      });
    }

    const updated = await prisma.merchantNotificationPreference.upsert({
      where: { merchantId: merchant.id },
      create: { merchantId: merchant.id, ...NOTIFICATION_PREF_DEFAULTS, ...updates },
      update: updates,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update notification preferences error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
