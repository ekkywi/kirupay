// src/app/api/merchant/webhook/regenerate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import crypto from "crypto";

export async function POST() {
    try {
        const merchant = await getCurrentMerchant();
        if (!merchant) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const newWebhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

        const updatedMerchant = await prisma.merchant.update({
            where: { id: merchant.id },
            data: { webhookSecret: newWebhookSecret },
        });

        return NextResponse.json({
            success: true,
            webhookSecret: updatedMerchant.webhookSecret,
        }, { status: 200 });
    
    } catch (error: unknown) {
        console.error("Webhook secret regeneration error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
