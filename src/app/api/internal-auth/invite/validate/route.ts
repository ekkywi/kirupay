import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { assertInternalAuthRateLimit, getRequestIp } from "@/lib/internal-auth-rate-limit";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const ip = getRequestIp(req);
    assertInternalAuthRateLimit(`internal-invite-validate:${ip}`);

    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return apiError(400, {
        code: "INTERNAL_INVITE_TOKEN_MISSING",
        message: "Invite token is required.",
        requestId,
        retryable: false,
      });
    }

    const invite = await (prisma as any).internalUserInvite.findUnique({ where: { tokenHash: hashToken(token) } });

    if (!invite) {
      return apiError(404, {
        code: "INTERNAL_INVITE_TOKEN_INVALID",
        message: "Invite token is invalid.",
        requestId,
        retryable: false,
      });
    }

    if (invite.usedAt) {
      return apiError(409, {
        code: "INTERNAL_INVITE_TOKEN_ALREADY_USED",
        message: "Invite token has already been used.",
        requestId,
        retryable: false,
      });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      return apiError(410, {
        code: "INTERNAL_INVITE_TOKEN_EXPIRED",
        message: "Invite token has expired.",
        requestId,
        retryable: false,
      });
    }

    return NextResponse.json(
      {
        valid: true,
        invite: {
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return apiError(429, {
        code: "INTERNAL_AUTH_RATE_LIMITED",
        message: "Too many requests. Please try again shortly.",
        requestId,
        retryable: true,
      });
    }

    console.error("Validate internal invite error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
