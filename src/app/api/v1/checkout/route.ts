// src/app/api/v1/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { createMaintenanceJsonResponse, getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { z } from "zod";

const checkoutSchema = z.object({
    orderId: z.string().min(1, "Order ID is required").max(100),
    amount: z.number().positive("Amount must be a positive number"),
    currency: z.literal("SOL", {
        errorMap: () => ({ message: "Only SOL currency is supported" })
    }),
    customerEmail: z.string().email("Invalid email address format").optional().nullable(),
    successUrl: z.string().url("Invalid URL format").optional().nullable(),
    cancelUrl: z.string().url("Invalid URL format").optional().nullable(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(req: Request) {
    try {
        const maintenanceBlock = await getPaymentMaintenanceBlock();

        if (maintenanceBlock) {
            return createMaintenanceJsonResponse(maintenanceBlock, corsHeaders);
        }

        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Missing or invalid Authorization header. Format: Bearer <YOUR_API_KEY>" },
                { status: 401, headers: corsHeaders }
            );
        }

        const apiKey = authHeader.split(" ")[1];
        const merchant = await prisma.merchant.findUnique({
            where: { apiKey }
        });

        if (!merchant || !merchant.isActive) {
            return NextResponse.json(
                { error: "Invalid or inactive API Key" },
                { status: 401, headers: corsHeaders }
            );
        }

        if (!merchant.walletAddress || merchant.walletAddress.includes("pending")) {
            return NextResponse.json(
                { error: "Merchant has not linked a settlement wallet yet." },
                { status: 400, headers: corsHeaders }
            );
        }

        const body = await req.json();
        const validation = checkoutSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid format data", details: validation.error.format() },
                { status: 400, headers: corsHeaders }
            );
        }

        const {
            orderId,
            amount,
            currency,
            customerEmail,
            successUrl,
            cancelUrl,
        } = validation.data;

        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                merchantId: merchant.id,
                orderId: orderId,
            }
        });

        if (existingTransaction) {
            return NextResponse.json(
                {
                    error: "Duplicate Order ID",
                    details: `Transaction with orderID '${orderId}' already exists. Please use a unique orderId.`
                },
                { status: 409, headers: corsHeaders }
            );
        }

        const transaction = await prisma.transaction.create({
            data: {
                merchantId: merchant.id,
                orderId: orderId,
                amount: amount,
                currency: currency,
                customerEmail: customerEmail || null,
                successUrl: successUrl || null,
                cancelUrl: cancelUrl || null,
                status: "PENDING",
                source: "API",
                createdAt: new Date(),
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const checkoutUrl = `${baseUrl}/pay/${transaction.id}`;

        return NextResponse.json({
            message: "Checkout session created successfully",
            transactionId: transaction.id,
            checkoutUrl: checkoutUrl,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }, { status: 201, headers: corsHeaders });
    
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Checkout API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: errorMessage },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
