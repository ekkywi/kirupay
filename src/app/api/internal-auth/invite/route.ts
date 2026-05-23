import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { requireInternalUser } from "@/lib/auth-service";
import { assertInternalAuthRateLimit, getRequestIp } from "@/lib/internal-auth-rate-limit";
import type { InternalRole } from "@prisma/client";

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;
const ALLOWED_ROLES: InternalRole[] = ["SUPERADMIN", "SUPPORT", "DEVELOPER"];

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const ip = getRequestIp(req);
    assertInternalAuthRateLimit(`internal-invite:${ip}`);

    const inviter = await requireInternalUser({ roles: ["SUPERADMIN"] });
    const { email, role } = await req.json();

    if (!email || !role) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["email", "role"] },
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return apiError(400, {
        code: "CHECKOUT_VALIDATION_FAILED",
        message: "Invalid role provided.",
        requestId,
        retryable: false,
      });
    }

    const existingUser = await prisma.internalUser.findUnique({ where: { email } });
    if (existingUser) {
      return apiError(409, {
        code: "INTERNAL_INVITE_EMAIL_CONFLICT",
        message: "An internal user with this email already exists.",
        requestId,
        retryable: false,
      });
    }

    const token = createToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    await (prisma as any).internalUserInvite.create({
      data: {
        email,
        role,
        tokenHash,
        expiresAt,
        invitedBy: inviter.id,
      },
    });

    const origin = new URL(req.url).origin;
    const inviteLink = `${origin}/internal/register?token=${token}`;

    console.info("[audit] internal_invite_created", {
      requestId,
      invitedBy: inviter.id,
      invitedByEmail: inviter.email,
      email,
      role,
      expiresAt: expiresAt.toISOString(),
    });

    return NextResponse.json(
      {
        message: "Internal invite created successfully.",
        invite: {
          email,
          role,
          expiresAt,
          inviteLink,
        },
      },
      { status: 201 },
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

    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return apiError(403, {
        code: "INTERNAL_INVITE_CREATION_FORBIDDEN",
        message: "Only SUPERADMIN can create internal invites.",
        requestId,
        retryable: false,
      });
    }

    console.error("Create internal invite error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
