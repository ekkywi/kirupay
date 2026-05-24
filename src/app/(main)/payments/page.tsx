import type { Metadata } from "next";
// src/app/dashboard/payments/page.tsx
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { ExportTransactionsButton } from "@/components/dashboard/ExportTransactionsButton";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, ReceiptText, TrendingUp } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments",
};

// Tentukan berapa banyak baris per halaman
const ITEMS_PER_PAGE = 10;

export default async function PaymentsPage({
  searchParams,
}: {
  // Tangkap parameter dari URL (dari komponen TransactionTable)
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const merchant = ctx.merchant;
  const business = ctx.business;

  const params = await searchParams;

  // 1. Ekstrak nilai dari URL
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const statusFilter = typeof params.status === "string" ? params.status : "ALL";
  const sourceFilter = typeof params.source === "string" ? params.source : "ALL";

  // 2. Buat kondisi filter untuk Prisma (WHERE clause dinamis)
  const whereCondition: Prisma.TransactionWhereInput = {
    businessId: business.id,
  };

  if (search) {
    whereCondition.OR = [
      { orderId: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerReference: { contains: search, mode: "insensitive" } },
      { txSignature: { contains: search, mode: "insensitive" } },
      { buyerWallet: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
    ];
  }

  // Jika ada filter status (PAID atau PENDING)
  if (statusFilter !== "ALL") {
    whereCondition.status = statusFilter;
  }

  if (sourceFilter === "API" || sourceFilter === "PAYMENT_LINK") {
    whereCondition.source = sourceFilter;
  }

  const baseWhere: Prisma.TransactionWhereInput = { businessId: business.id };

  // 3. Hitung TOTAL SELURUH DATA (untuk membuat nomor halaman)
  const [
    totalItems,
    paidStats,
    pendingCount,
    failedCount,
  ] = await Promise.all([
    prisma.transaction.count({ where: whereCondition }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, status: "PAID" },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
    }),
    prisma.transaction.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.transaction.count({ where: { ...baseWhere, status: "FAILED" } }),
  ]);
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // 4. Ambil HANYA 10 DATA sesuai halaman saat ini (Pagination)
  const transactions = await prisma.transaction.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const grossVolume = paidStats._sum.amount || 0;
  const feeVolume = paidStats._sum.feeAmount || 0;
  const netVolume = paidStats._sum.netAmount || 0;
  const paidCount = paidStats._count.id;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Activity className="h-4 w-4" />
            Payments ledger
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Transaction history
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reconcile gross payments, platform fees, net settlement, and on-chain confirmation.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ExportTransactionsButton />
          <Link href="/payment-links" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Payment links
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/analytics" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            View analytics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Net settlement", value: `${netVolume.toFixed(4)} SOL`, detail: "after platform fee", tone: "emerald" },
          { icon: ReceiptText, label: "Gross volume", value: `${grossVolume.toFixed(4)} SOL`, detail: `${feeVolume.toFixed(4)} SOL fees`, tone: "blue" },
          { icon: CheckCircle2, label: "Paid transactions", value: paidCount.toString(), detail: "confirmed payments", tone: "emerald" },
          { icon: Clock3, label: "Pending / failed", value: `${pendingCount} / ${failedCount}`, detail: "open payment states", tone: "amber" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <metric.icon className={`mb-4 h-5 w-5 ${metric.tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : metric.tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>
      
      {/* Kirim data yang sudah difilter dan total halaman ke tabel */}
      <TransactionTable 
        transactions={transactions} 
        totalPages={totalPages} 
      />
    </div>
  );
}
