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

    const internalUser = await prisma.internalUser.findUnique({ where: { email } });

    if (!internalUser || !internalUser.isActive) {
      return apiError(401, {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        requestId,
        retryable: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, internalUser.password);
    if (!isPasswordValid) {
      return apiError(401, {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        requestId,
        retryable: false,
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ actorType: "internal", actorId: internalUser.id, email: internalUser.email })
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
        user: {
          id: internalUser.id,
          name: internalUser.name,
          email: internalUser.email,
          role: internalUser.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during internal login", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
