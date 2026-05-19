// src/app/api/internal/confirm/route.ts
import { NextResponse } from "next/server";
import { confirmTransactionPayment } from "@/lib/payment-recovery";

export async function POST(req: Request) {
  try {
    const { transactionId, signature, buyerWallet, walletProvider } = await req.json();

    if (!transactionId || !signature) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const result = await confirmTransactionPayment({
      transactionId,
      signature,
      buyerWallet: buyerWallet || null,
      walletProvider: walletProvider || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode ?? 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Transaction marked as PAID",
      webhookLogId: result.webhookLogId,
      data: result.transaction 
    });

  } catch (error: any) {
    console.error("Confirmation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}