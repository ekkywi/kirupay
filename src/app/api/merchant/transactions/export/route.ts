import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

const CSV_HEADERS = [
  "transactionId",
  "merchantId",
  "orderId",
  "status",
  "currency",
  "grossAmount",
  "feeAmount",
  "netAmount",
  "txSignature",
  "source",
  "buyerWallet",
  "customerEmail",
  "customerReference",
  "customerName",
  "notes",
  "createdAtUtc",
  "updatedAtUtc",
] as const;

const ALLOWED_STATUS = new Set(["PAID", "PENDING", "FAILED", "ALL"]);

function toCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function dateToYyyyMmDdUtc(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

function parseIsoDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function GET(request: Request) {
  const requestId = createRequestId();

  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = (searchParams.get("status") || "PAID").toUpperCase();
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (!ALLOWED_STATUS.has(statusParam)) {
      return apiError(400, {
        code: "MERCHANT_EXPORT_VALIDATION_FAILED",
        message: "Invalid status filter. Allowed values: PAID, PENDING, FAILED, ALL.",
        requestId,
        retryable: false,
      });
    }

    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fromDate = fromParam ? parseIsoDate(fromParam) : defaultFrom;
    const toDate = toParam ? parseIsoDate(toParam) : now;

    if (!fromDate || !toDate) {
      return apiError(400, {
        code: "MERCHANT_EXPORT_VALIDATION_FAILED",
        message: "Invalid date filter. Use ISO date string for from/to.",
        requestId,
        retryable: false,
      });
    }

    if (fromDate > toDate) {
      return apiError(400, {
        code: "MERCHANT_EXPORT_VALIDATION_FAILED",
        message: "`from` cannot be later than `to`.",
        requestId,
        retryable: false,
      });
    }

    const where: Prisma.TransactionWhereInput = {
      merchantId: merchant.id,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      ...(statusParam !== "ALL" ? { status: statusParam } : {}),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        merchantId: true,
        orderId: true,
        status: true,
        currency: true,
        amount: true,
        feeAmount: true,
        netAmount: true,
        txSignature: true,
        source: true,
        buyerWallet: true,
        customerEmail: true,
        customerReference: true,
        customerName: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const rows = transactions.map((tx) =>
      [
        tx.id,
        tx.merchantId,
        tx.orderId,
        tx.status,
        tx.currency,
        String(tx.amount),
        tx.feeAmount == null ? "" : String(tx.feeAmount),
        tx.netAmount == null ? "" : String(tx.netAmount),
        tx.txSignature ?? "",
        tx.source,
        tx.buyerWallet ?? "",
        tx.customerEmail ?? "",
        tx.customerReference ?? "",
        tx.customerName ?? "",
        tx.notes ?? "",
        tx.createdAt.toISOString(),
        tx.updatedAt.toISOString(),
      ].map(toCsvCell).join(","),
    );

    const csv = `${CSV_HEADERS.join(",")}\n${rows.join("\n")}`;
    const filename = `transactions-reconciliation-${dateToYyyyMmDdUtc(now)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export transactions CSV error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
