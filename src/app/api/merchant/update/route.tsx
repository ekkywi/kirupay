// app/api/merchant/update/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { webhookUrl, businessName } = (await req.json()) as {
      webhookUrl?: string;
      businessName?: string;
    };
    const updateData: { webhookUrl?: string; businessName?: string; webhookSecret?: string } = {};

    if (businessName !== undefined) updateData.businessName = businessName;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;

    if (webhookUrl && !merchant.webhookSecret) {
      updateData.webhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
    }

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: updateData,
    });

    return NextResponse.json(
      { success: true, data: updated },
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Update merchant Error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  };
}
