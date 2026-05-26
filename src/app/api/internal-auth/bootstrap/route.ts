import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";

const FLAG = "INTERNAL_BOOTSTRAP_ENABLED";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    if (process.env[FLAG] !== "true") {
      return apiError(403, {
        code: "INTERNAL_BOOTSTRAP_DISABLED",
        message: `Bootstrap disabled. Set ${FLAG}=true to enable once-off bootstrap.`,
        requestId,
        retryable: false,
      });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["name", "email", "password"] },
      });
    }

    const existingCount = await prisma.internalUser.count();
    if (existingCount > 0) {
      return apiError(409, {
        code: "INTERNAL_BOOTSTRAP_ALREADY_INITIALIZED",
        message: "Internal users already exist. Bootstrap can only be used for first account.",
        requestId,
        retryable: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.internalUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: "Bootstrap successful", user }, { status: 201 });
  } catch (error) {
    console.error("Internal bootstrap error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
