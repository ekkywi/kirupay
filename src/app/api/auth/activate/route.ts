import { NextResponse } from "next/server";
import { apiError, createRequestId } from "@/lib/api-errors";
import { consumeMerchantVerificationToken } from "@/lib/email-verification";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return apiError(400, {
        code: "AUTH_ACTIVATION_TOKEN_MISSING",
        message: "Missing activation token.",
        requestId,
        retryable: false,
      });
    }

    const merchantId = await consumeMerchantVerificationToken(token);

    if (!merchantId) {
      return apiError(400, {
        code: "AUTH_ACTIVATION_TOKEN_INVALID",
        message: "Invalid or expired activation link.",
        requestId,
        retryable: false,
      });
    }

    return NextResponse.json({ message: "Account activated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Activation error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
