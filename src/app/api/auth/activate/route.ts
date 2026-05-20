import prisma from "@/lib/neon";
import { NextResponse } from "next/server";
import { apiError, createRequestId } from "@/lib/api-errors";

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

    const merchant = await prisma.merchant.findUnique({ where: { activationToken: token } });

    if (!merchant) {
      return apiError(400, {
        code: "AUTH_ACTIVATION_TOKEN_INVALID",
        message: "Invalid or expired activation link.",
        requestId,
        retryable: false,
      });
    }

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        emailVerified: true,
        activationToken: null,
      },
    });

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
