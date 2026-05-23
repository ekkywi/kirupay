import crypto from "crypto";
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "AUTH_MISSING_BEARER_TOKEN"
  | "AUTH_INVALID_API_KEY"
  | "AUTH_MISSING_REQUIRED_FIELDS"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_EMAIL_NOT_VERIFIED"
  | "AUTH_PROFILE_SETUP_REQUIRED"
  | "AUTH_ACTIVATION_TOKEN_MISSING"
  | "AUTH_ACTIVATION_TOKEN_INVALID"
  | "AUTH_WALLET_SIGNATURE_INVALID"
  | "AUTH_PROFILE_EMAIL_CONFLICT"
  | "AUTH_MERCHANT_NOT_FOUND"
  | "AUTH_EMAIL_ALREADY_VERIFIED"
  | "MERCHANT_UNAUTHORIZED"
  | "MERCHANT_EXPORT_VALIDATION_FAILED"
  | "MERCHANT_INVALID_ACTION"
  | "MERCHANT_MISSING_CRYPTO_PROOFS"
  | "MERCHANT_WALLET_SIGNATURE_INVALID"
  | "MERCHANT_WALLET_ALREADY_LINKED"
  | "MERCHANT_WALLET_NOT_LINKED"
  | "CHECKOUT_VALIDATION_FAILED"
  | "CHECKOUT_DUPLICATE_ORDER_ID"
  | "INTERNAL_CONFIRMATION_MISSING_FIELDS"
  | "INTERNAL_CONFIRMATION_REJECTED"
  | "INTERNAL_RPC_TELEMETRY_INVALID_PAYLOAD"
  | "INTERNAL_CRON_UNAUTHORIZED"
  | "INTERNAL_BOOTSTRAP_DISABLED"
  | "INTERNAL_BOOTSTRAP_ALREADY_INITIALIZED"
  | "INTERNAL_AUTH_RATE_LIMITED"
  | "INTERNAL_INVITE_TOKEN_MISSING"
  | "INTERNAL_INVITE_TOKEN_INVALID"
  | "INTERNAL_INVITE_TOKEN_EXPIRED"
  | "INTERNAL_INVITE_TOKEN_ALREADY_USED"
  | "INTERNAL_INVITE_CREATION_FORBIDDEN"
  | "INTERNAL_INVITE_EMAIL_CONFLICT"
  | "MAINTENANCE_MODE_ACTIVE"
  | "INTERNAL_SERVER_ERROR";

export type ApiErrorDetails = Record<string, unknown>;

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    requestId: string;
    retryable: boolean;
    docsUrl: string;
    details?: ApiErrorDetails;
  };
};

export function createRequestId() {
  return `req_${crypto.randomUUID()}`;
}

export function errorDocsUrl(code: ApiErrorCode) {
  return `/docs/error-reference#error-${code.toLowerCase()}`;
}

export function apiError(
  status: number,
  input: {
    code: ApiErrorCode;
    message: string;
    requestId: string;
    retryable: boolean;
    details?: ApiErrorDetails;
  },
  options?: { headers?: HeadersInit },
) {
  console.error("[api-error]", {
    status,
    code: input.code,
    requestId: input.requestId,
    retryable: input.retryable,
  });

  const body: ApiErrorResponse = {
    error: {
      code: input.code,
      message: input.message,
      requestId: input.requestId,
      retryable: input.retryable,
      docsUrl: errorDocsUrl(input.code),
      ...(input.details ? { details: input.details } : {}),
    },
  };

  return NextResponse.json(body, {
    status,
    headers: options?.headers,
  });
}
