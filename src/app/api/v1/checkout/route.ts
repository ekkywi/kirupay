// src/app/api/v1/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { getMissingUsdcConfigKeys, resolveAssetConfig, UsdcConfigError } from "@/lib/asset-config";
import { resolveSolanaRpcConfig } from "@/lib/solana-rpc";
import { z } from "zod";

const checkoutSchema = z.object({
    orderId: z.string().min(1, "Order ID is required").max(100),
    amount: z.number().positive("Amount must be a positive number"),
    currency: z.enum(["SOL", "USDC"], {
        errorMap: () => ({ message: "Supported currencies: SOL, USDC" })
    }),
    customerEmail: z.string().email("Invalid email address format").optional().nullable(),
    customerReference: z.string().min(1, "Customer reference cannot be empty").max(80, "Customer reference cannot exceed 80 characters").optional().nullable(),
    customerName: z.string().min(1, "Customer name cannot be empty").max(80, "Customer name cannot exceed 80 characters").optional().nullable(),
    notes: z.string().min(1, "Notes cannot be empty").max(300, "Notes cannot exceed 300 characters").optional().nullable(),
    successUrl: z.string().url("Invalid URL format").optional().nullable(),
    cancelUrl: z.string().url("Invalid URL format").optional().nullable(),
});

function cleanOptionalText(value: string | null | undefined) {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}
const CHECKOUT_TTL_MS = 30 * 60 * 1000;

type CheckoutCredential = {
    businessId: string;
    business: {
        isActive: boolean;
        settlementWallets: Array<{ walletAddress: string }>;
    };
};

type BusinessCredentialClient = {
    findUnique: (args: {
        where: { apiKey: string };
        include: {
            business: {
                include: {
                    settlementWallets: { where: { isActive: true }; take: number };
                };
            };
        };
    }) => Promise<CheckoutCredential | null>;
};

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
        const businessCredentialClient = (prisma as unknown as { businessCredential?: BusinessCredentialClient }).businessCredential;
        let credential: CheckoutCredential | null = null;
        if (businessCredentialClient?.findUnique) {
            credential = await businessCredentialClient.findUnique({
                where: { apiKey },
                include: {
                  business: {
                    include: {
                      settlementWallets: { where: { isActive: true }, take: 1 },
                    },
                  },
                },
            });
        }

        if (!credential || !credential.business.isActive) {
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

        if (!credential.business.settlementWallets[0]) {
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
            customerReference,
            customerName,
            notes,
            successUrl,
            cancelUrl,
        } = validation.data;

        if (currency === "USDC") {
            const clientCluster = resolveSolanaRpcConfig("client").cluster;
            const missingClientKeys = getMissingUsdcConfigKeys(clientCluster, "client");
            if (missingClientKeys.length > 0) {
                recordObservation(obs, {
                    outcome: "error",
                    status: 400,
                    errorCode: "USDC_CLIENT_CONFIG_MISSING",
                });
                return apiError(
                    400,
                    {
                        code: "USDC_CLIENT_CONFIG_MISSING",
                        message: "USDC checkout client configuration is missing. Please set required NEXT_PUBLIC USDC variables.",
                        requestId,
                        retryable: false,
                        details: {
                            cluster: clientCluster,
                            missingKeys: missingClientKeys,
                        },
                    },
                    { headers: corsHeaders },
                );
            }

            try {
                resolveAssetConfig("USDC", "server");
            } catch (error: unknown) {
                if (error instanceof UsdcConfigError) {
                    recordObservation(obs, {
                        outcome: "error",
                        status: 500,
                        errorCode: "USDC_ASSET_CONFIG_MISSING",
                    });
                    return apiError(
                        500,
                        {
                            code: "USDC_ASSET_CONFIG_MISSING",
                            message: "USDC checkout server configuration is missing for the active network.",
                            requestId,
                            retryable: false,
                            details: {
                                cluster: error.cluster,
                                missingKeys: error.missingKeys ?? [],
                            },
                        },
                        { headers: corsHeaders },
                    );
                }
                recordObservation(obs, {
                    outcome: "error",
                    status: 500,
                    errorCode: "INTERNAL_SERVER_ERROR",
                });
                return apiError(
                    500,
                    {
                        code: "INTERNAL_SERVER_ERROR",
                        message: "USDC checkout is not configured for the active network.",
                        requestId,
                        retryable: false,
                    },
                    { headers: corsHeaders },
                );
            }
        }

        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                businessId: credential.businessId,
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
                    message: "Order ID already exists for this business. Please use a unique orderId.",
                    requestId,
                    retryable: false,
                    details: {
                        orderId,
                    },
                },
                { headers: corsHeaders },
            );
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + CHECKOUT_TTL_MS);

        const transaction = await prisma.transaction.create({
            data: {
                businessId: credential.businessId,
                orderId: orderId,
                amount: amount,
                currency: currency,
                customerEmail: customerEmail || null,
                customerReference: cleanOptionalText(customerReference),
                customerName: cleanOptionalText(customerName),
                notes: cleanOptionalText(notes),
                successUrl: successUrl || null,
                cancelUrl: cancelUrl || null,
                status: "PENDING",
                source: "API",
                createdAt: now,
                expiresAt,
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
            expiresAt: transaction.expiresAt,
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
