import crypto from "crypto";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { assertInternalAuthRateLimit, getRequestIp } from "@/lib/internal-auth-rate-limit";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const ip = getRequestIp(req);
    assertInternalAuthRateLimit(`internal-register:${ip}`);

    const { token, name, password } = await req.json();

    if (!token || !name || !password) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["token", "name", "password"] },
      });
    }

    if (!passwordRegex.test(password)) {
      return apiError(400, {
        code: "CHECKOUT_VALIDATION_FAILED",
        message: "Password does not meet security requirements.",
        requestId,
        retryable: false,
      });
    }

    const tokenHash = hashToken(token);

    const invite = await (prisma as any).internalUserInvite.findUnique({ where: { tokenHash } });

    if (!invite) {
      console.info("[audit] internal_invite_register_failed", { requestId, reason: "invalid-token" });
      return apiError(404, {
        code: "INTERNAL_INVITE_TOKEN_INVALID",
        message: "Invite token is invalid.",
        requestId,
        retryable: false,
      });
    }

    if (invite.usedAt) {
      console.info("[audit] internal_invite_register_failed", { requestId, reason: "used-token", inviteId: invite.id });
      return apiError(409, {
        code: "INTERNAL_INVITE_TOKEN_ALREADY_USED",
        message: "Invite token has already been used.",
        requestId,
        retryable: false,
      });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      console.info("[audit] internal_invite_register_failed", { requestId, reason: "expired-token", inviteId: invite.id });
      return apiError(410, {
        code: "INTERNAL_INVITE_TOKEN_EXPIRED",
        message: "Invite token has expired.",
        requestId,
        retryable: false,
      });
    }

    const existingUser = await prisma.internalUser.findUnique({ where: { email: invite.email } });
    if (existingUser) {
      return apiError(409, {
        code: "INTERNAL_INVITE_EMAIL_CONFLICT",
        message: "An internal user with this email already exists.",
        requestId,
        retryable: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.internalUser.create({
        data: {
          email: invite.email,
          name,
          password: hashedPassword,
          role: invite.role,
          isActive: true,
        },
      });

      await (tx as any).internalUserInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    console.info("[audit] internal_invite_consumed", {
      requestId,
      inviteId: invite.id,
      email: invite.email,
      role: invite.role,
      internalUserId: createdUser.id,
    });

    return NextResponse.json({ message: "Internal account registered successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return apiError(429, {
        code: "INTERNAL_AUTH_RATE_LIMITED",
        message: "Too many requests. Please try again shortly.",
        requestId,
        retryable: true,
      });
    }

    console.error("Internal register error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
