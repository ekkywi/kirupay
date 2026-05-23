import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const { publicKey, signature, message } = await req.json();
    const signatureUint8 = bs58.decode(signature);
    const messageUint8 = new TextEncoder().encode(message);
    const pubKeyUint8 = bs58.decode(publicKey);
    const isValid = sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);

    if (!isValid) {
      return apiError(401, {
        code: "AUTH_WALLET_SIGNATURE_INVALID",
        message: "Invalid wallet signature.",
        requestId,
        retryable: false,
      });
    }

    const existingIdentity = await prisma.merchantWalletIdentity.findUnique({
      where: { walletAddress: publicKey },
      include: { merchant: true },
    });

    let merchant = existingIdentity?.merchant;

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          walletAddress: publicKey,
          businessName: `Merchant ${publicKey.slice(0, 4)}`,
          email: `${publicKey}@wallet.auth`,
          password: "WALLET_AUTH_NO_PASSWORD",
          apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`,
          walletIdentities: {
            create: {
              walletAddress: publicKey,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          },
        },
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ actorType: "merchant", actorId: merchant.id, wallet: publicKey })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ success: true, merchantId: merchant.id });
  } catch (error) {
    console.error("Wallet verify error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Authentication failed.",
      requestId,
      retryable: true,
    });
  }
}
