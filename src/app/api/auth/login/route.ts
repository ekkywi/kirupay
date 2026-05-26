import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["email", "password"] },
      });
    }

    const merchant = await prisma.merchant.findUnique({ where: { email } });

    if (!merchant) {
      return apiError(401, {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        requestId,
        retryable: false,
      });
    }

    if (!merchant.emailVerified) {
      return apiError(403, {
        code: "AUTH_EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
        requestId,
        retryable: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, merchant.password);
    if (!isPasswordValid) {
      return apiError(401, {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        requestId,
        retryable: false,
      });
    }

    const firstMembership = await prisma.businessMembership.findFirst({
      where: { merchantId: merchant.id, isActive: true, business: { isActive: true } },
      orderBy: { createdAt: "asc" },
    });

    const activeBusinessId = merchant.activeBusinessId ?? firstMembership?.businessId ?? null;
    if (activeBusinessId !== merchant.activeBusinessId) {
      await prisma.merchant.update({ where: { id: merchant.id }, data: { activeBusinessId } });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      actorType: "merchant",
      actorId: merchant.id,
      email: merchant.email,
      activeBusinessId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        merchant: {
          id: merchant.id,
          businessName: merchant.businessName,
          email: merchant.email,
          activeBusinessId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during login", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
