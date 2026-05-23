import crypto from "crypto";
import prisma from "@/lib/neon";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueMerchantVerificationToken(merchantId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.merchantEmailVerificationToken.updateMany({
      where: { merchantId, usedAt: null },
      data: { usedAt: new Date() },
    });

    await tx.merchantEmailVerificationToken.create({
      data: {
        merchantId,
        tokenHash,
        expiresAt,
      },
    });
  });

  return rawToken;
}

export async function consumeMerchantVerificationToken(token: string) {
  const tokenHash = hashToken(token);
  const existing = await prisma.merchantEmailVerificationToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.usedAt || existing.expiresAt.getTime() < Date.now()) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.merchantEmailVerificationToken.update({
      where: { id: existing.id },
      data: { usedAt: new Date() },
    });
    await tx.merchant.update({
      where: { id: existing.merchantId },
      data: { emailVerified: true },
    });
  });

  return existing.merchantId;
}
