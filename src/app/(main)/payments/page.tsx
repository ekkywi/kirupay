import type { Metadata } from "next";
// src/app/dashboard/payments/page.tsx
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { ExportTransactionsButton } from "@/components/dashboard/ExportTransactionsButton";
import { PaymentsAutoRefresh } from "@/components/dashboard/PaymentsAutoRefresh";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, ReceiptText, TrendingUp } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrencyDisplay } from "@/lib/currency-format";

export const metadata: Metadata = {
  title: "Payments",
};

// Tentukan berapa banyak baris per halaman
const ITEMS_PER_PAGE = 10;
type CurrencyMetric = {
  currency: string;
  gross: number;
  fee: number;
  net: number;
};

type PaymentMetricCard = {
  icon: typeof Activity;
  label: string;
  value: string | null;
  detail: string;
  tone: "emerald" | "amber" | "blue";
  rows?: Array<{
    key: string;
    value: string;
    subvalue?: string;
  }>;
};

export default async function PaymentsPage({
  searchParams,
}: {
  // Tangkap parameter dari URL (dari komponen TransactionTable)
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const business = ctx.business;

  const params = await searchParams;

  // 1. Ekstrak nilai dari URL
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const statusFilter = typeof params.status === "string" ? params.status : "ALL";
  const sourceFilter = typeof params.source === "string" ? params.source : "ALL";
  const currencyFilter = typeof params.currency === "string" ? params.currency : "ALL";

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

  if (currencyFilter !== "ALL") {
    whereCondition.currency = currencyFilter;
  }

  const baseWhere: Prisma.TransactionWhereInput = { businessId: business.id };

  // 3. Hitung TOTAL SELURUH DATA (untuk membuat nomor halaman)
  const [
    totalItems,
    paidStatsByCurrency,
    pendingCount,
    failedCount,
    currencyList,
  ] = await Promise.all([
    prisma.transaction.count({ where: whereCondition }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID" },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.transaction.count({ where: { ...baseWhere, status: "FAILED" } }),
    prisma.transaction.findMany({
      where: baseWhere,
      distinct: ["currency"],
      select: { currency: true },
      orderBy: { currency: "asc" },
    }),
  ]);
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // 4. Ambil HANYA 10 DATA sesuai halaman saat ini (Pagination)
  const transactions = await prisma.transaction.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const metricsByCurrency: CurrencyMetric[] = paidStatsByCurrency
    .map((row) => ({
      currency: row.currency,
      gross: row._sum.amount ?? 0,
      fee: row._sum.feeAmount ?? 0,
      net: row._sum.netAmount ?? 0,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  const paidCount = paidStatsByCurrency.reduce((sum, row) => sum + row._count.id, 0);
  const selectedCurrency = currencyFilter !== "ALL" ? currencyFilter : null;
  const hasSingleCurrencyView = selectedCurrency && selectedCurrency !== "ALL";
  const selectedMetric = hasSingleCurrencyView
    ? metricsByCurrency.find((item) => item.currency === selectedCurrency) ?? {
      currency: selectedCurrency,
      gross: 0,
      fee: 0,
      net: 0,
    }
    : null;
  const paymentMetricCards: PaymentMetricCard[] = [
    {
      icon: TrendingUp,
      label: "Net settlement",
      value: hasSingleCurrencyView
        ? formatCurrencyDisplay(selectedCurrency, selectedMetric?.net ?? 0)
        : null,
      detail: "after platform fee",
      tone: "emerald",
      rows: hasSingleCurrencyView
        ? []
        : metricsByCurrency.map((item) => ({
          key: item.currency,
          value: formatCurrencyDisplay(item.currency, item.net),
        })),
    },
    {
      icon: ReceiptText,
      label: "Gross volume",
      value: hasSingleCurrencyView
        ? formatCurrencyDisplay(selectedCurrency, selectedMetric?.gross ?? 0)
        : null,
      detail: hasSingleCurrencyView
        ? `${formatCurrencyDisplay(selectedCurrency, selectedMetric?.fee ?? 0)} fees`
        : "fee breakdown per currency",
      tone: "blue",
      rows: hasSingleCurrencyView
        ? []
        : metricsByCurrency.map((item) => ({
          key: item.currency,
          value: formatCurrencyDisplay(item.currency, item.gross),
          subvalue: `${formatCurrencyDisplay(item.currency, item.fee)} fees`,
        })),
    },
    { icon: CheckCircle2, label: "Paid transactions", value: paidCount.toString(), detail: "confirmed payments", tone: "emerald" },
    { icon: Clock3, label: "Pending / failed", value: `${pendingCount} / ${failedCount}`, detail: "open payment states", tone: "amber" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PaymentsAutoRefresh />
      <div className="dashboard-header flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
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
          <ExportTransactionsButton currencyOptions={currencyList.map((item) => item.currency)} />
          <Link href="/payment-links" className="dashboard-secondary">
            Payment links
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/analytics" className="dashboard-primary">
            View analytics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {paymentMetricCards.map((metric) => (
          <div key={metric.label} className="dashboard-card p-5">
            <metric.icon className={`mb-4 h-5 w-5 ${metric.tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : metric.tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            {metric.value ? (
              <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            ) : metric.rows && metric.rows.length > 0 ? (
              <div className="mt-3 space-y-2">
                {metric.rows.map((row) => (
                  <div key={row.key} className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{row.key}</span>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-950 dark:text-white">{row.value}</p>
                      {row.subvalue ? <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.subvalue}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 font-mono text-sm font-semibold text-slate-500 dark:text-slate-400">No paid transactions yet</p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>
      
      {/* Kirim data yang sudah difilter dan total halaman ke tabel */}
      <TransactionTable 
        transactions={transactions} 
        totalPages={totalPages}
        currencyOptions={currencyList.map((item) => item.currency)}
      />
    </div>
  );
}
