// src/app/api/v1/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
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
    const requestId = createRequestId();
    const obs = startObservation(requestId, "POST /api/v1/checkout");
    try {
        const maintenanceBlock = await getPaymentMaintenanceBlock();

        if (maintenanceBlock) {
            recordObservation(obs, {
                outcome: "error",
                status: maintenanceBlock.status,
                errorCode: "MAINTENANCE_MODE_ACTIVE",
            });
            return apiError(
                maintenanceBlock.status,
                {
                    code: "MAINTENANCE_MODE_ACTIVE",
                    message: maintenanceBlock.payload.message,
                    requestId,
                    retryable: true,
                    details: {
                        maintenanceEndsAt: maintenanceBlock.payload.maintenanceEndsAt,
                    },
                },
                {
                    headers: {
                        ...corsHeaders,
                        "Retry-After": maintenanceBlock.retryAfter,
                    },
                },
            );
        }

        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            recordObservation(obs, {
                outcome: "error",
                status: 401,
                errorCode: "AUTH_MISSING_BEARER_TOKEN",
            });
            return apiError(
                401,
                {
                    code: "AUTH_MISSING_BEARER_TOKEN",
                    message: "Missing or invalid Authorization header. Format: Bearer <YOUR_API_KEY>.",
                    requestId,
                    retryable: false,
                },
                { headers: corsHeaders },
            );
        }

        const apiKey = authHeader.split(" ")[1];
        const merchant = await prisma.merchant.findUnique({
            where: { apiKey }
        });

        if (!merchant || !merchant.isActive) {
            recordObservation(obs, {
                outcome: "error",
                status: 401,
                errorCode: "AUTH_INVALID_API_KEY",
            });
            return apiError(
                401,
                {
                    code: "AUTH_INVALID_API_KEY",
                    message: "Invalid or inactive API key.",
                    requestId,
                    retryable: false,
                },
                { headers: corsHeaders },
            );
        }

        if (!merchant.walletAddress || merchant.walletAddress.includes("pending")) {
            recordObservation(obs, {
                outcome: "error",
                status: 400,
                errorCode: "MERCHANT_WALLET_NOT_LINKED",
            });
            return apiError(
                400,
                {
                    code: "MERCHANT_WALLET_NOT_LINKED",
                    message: "Merchant has not linked a settlement wallet yet.",
                    requestId,
                    retryable: false,
                },
                { headers: corsHeaders },
            );
        }

        const body = await req.json();
        const validation = checkoutSchema.safeParse(body);

        if (!validation.success) {
            recordObservation(obs, {
                outcome: "error",
                status: 400,
                errorCode: "CHECKOUT_VALIDATION_FAILED",
            });
            return apiError(
                400,
                {
                    code: "CHECKOUT_VALIDATION_FAILED",
                    message: "Request payload failed validation.",
                    requestId,
                    retryable: false,
                    details: validation.error.format() as Record<string, unknown>,
                },
                { headers: corsHeaders },
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
            recordObservation(obs, {
                outcome: "error",
                status: 409,
                errorCode: "CHECKOUT_DUPLICATE_ORDER_ID",
            });
            return apiError(
                409,
                {
                    code: "CHECKOUT_DUPLICATE_ORDER_ID",
                    message: "Order ID already exists for this merchant. Please use a unique orderId.",
                    requestId,
                    retryable: false,
                    details: {
                        orderId,
                    },
                },
                { headers: corsHeaders },
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

        recordObservation(obs, {
            outcome: "success",
            status: 201,
        });

        return NextResponse.json({
            message: "Checkout session created successfully",
            transactionId: transaction.id,
            checkoutUrl: checkoutUrl,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }, { status: 201, headers: corsHeaders });
    
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Checkout API Error", { requestId, error });
        recordObservation(obs, {
            outcome: "error",
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
        });
        return apiError(
            500,
            {
                code: "INTERNAL_SERVER_ERROR",
                message: "Unexpected server error.",
                requestId,
                retryable: true,
                details: { reason: errorMessage },
            },
            { headers: corsHeaders },
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
