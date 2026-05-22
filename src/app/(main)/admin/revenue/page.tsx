import type { Metadata } from "next";
// src/app/(main)/admin/revenue/page.tsx
import prisma from "@/lib/neon";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Landmark,
  LineChart,
  Receipt,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";

export const metadata: Metadata = {
  title: "Admin Revenue",
};

const FEE_RATE = 0.003;
const formatSOL = (value: number | null | undefined, precision = 5) => (value ?? 0).toFixed(precision);

function formatCompactDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminRevenuePage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalStats,
    monthStats,
    dayStats,
    weeklyStats,
    paidTransactionCount,
    recentFees,
    topFeeMerchants,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { feeAmount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true, feeAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfDay } },
      _sum: { amount: true, feeAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: last7Days } },
      _sum: { amount: true, feeAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.count({ where: { status: "PAID" } }),
    prisma.transaction.findMany({
      where: { status: "PAID", feeAmount: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        merchant: { select: { businessName: true, email: true } },
      },
    }),
    prisma.transaction.groupBy({
      by: ["merchantId"],
      where: { status: "PAID", feeAmount: { gt: 0 } },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true },
      orderBy: { _sum: { feeAmount: "desc" } },
      take: 5,
    }),
  ]);

  const topMerchantProfiles = await prisma.merchant.findMany({
    where: { id: { in: topFeeMerchants.map((merchant) => merchant.merchantId) } },
    select: { id: true, businessName: true, email: true },
  });

  const merchantById = new Map(topMerchantProfiles.map((merchant) => [merchant.id, merchant]));
  const totalRevenue = totalStats._sum.feeAmount || 0;
  const totalVolume = totalStats._sum.amount || 0;
  const totalNetSettlement = totalStats._sum.netAmount || 0;
  const monthRevenue = monthStats._sum.feeAmount || 0;
  const dayRevenue = dayStats._sum.feeAmount || 0;
  const weeklyRevenue = weeklyStats._sum.feeAmount || 0;
  const weeklyVolume = weeklyStats._sum.amount || 0;
  const averageFee = totalStats._avg.feeAmount || 0;
  const realizedFeeRate = totalVolume > 0 ? (totalRevenue / totalVolume) * 100 : 0;
  const monthContribution = totalRevenue > 0 ? (monthRevenue / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <Landmark className="h-4 w-4" />
            Treasury and revenue
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Platform earnings command center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track fee yield, treasury balance, merchant contribution, and recent revenue deposits from paid transactions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/transactions" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Audit ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white opacity-80 dark:bg-white dark:text-slate-950">
            <ArrowDownToLine className="h-4 w-4" />
            Cold wallet queue
          </button>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: Landmark,
            label: "Total treasury",
            value: `${formatSOL(totalRevenue)} SOL`,
            detail: `${paidTransactionCount} paid fee events`,
            tone: "emerald",
          },
          {
            icon: CalendarDays,
            label: "This month",
            value: `${formatSOL(monthRevenue)} SOL`,
            detail: `${monthContribution.toFixed(1)}% of all-time fees`,
            tone: "blue",
          },
          {
            icon: Banknote,
            label: "Today",
            value: `${formatSOL(dayRevenue)} SOL`,
            detail: `${dayStats._count.id} paid transactions`,
            tone: "emerald",
          },
          {
            icon: TrendingUp,
            label: "Realized fee rate",
            value: `${realizedFeeRate.toFixed(2)}%`,
            detail: `target ${(FEE_RATE * 100).toFixed(1)}% platform fee`,
            tone: Math.abs(realizedFeeRate - FEE_RATE * 100) < 0.05 || totalVolume === 0 ? "emerald" : "amber",
          },
        ].map((metric) => (
          <AdminMetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone as "blue" | "emerald" | "amber"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <AdminSurface>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">Revenue cadence</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Treasury pulse</h2>
              </div>
              <LineChart className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "7-day fees", value: `${formatSOL(weeklyRevenue)} SOL`, icon: Clock3 },
                { label: "7-day volume", value: `${formatSOL(weeklyVolume, 4)} SOL`, icon: TrendingUp },
                { label: "Net settled", value: `${formatSOL(totalNetSettlement, 4)} SOL`, icon: WalletCards },
                { label: "Avg fee", value: `${formatSOL(averageFee)} SOL`, icon: Receipt },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <item.icon className="mb-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </AdminSurface>

          <AdminSurface>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Treasury controls</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Fee revenue is calculated from confirmed paid transactions. Withdraw execution should remain gated behind operational approval before cold-wallet transfer.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Fee model", value: "0.3% gross", ok: true },
                { label: "Revenue basis", value: "Paid tx only", ok: true },
                { label: "Withdrawal status", value: "Manual review", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </AdminSurface>
        </div>

        <AdminSurface padded={false}>
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
            <AdminSectionHeader eyebrow="Merchant contribution" title="Top fee contributors" />
            <Receipt className="h-5 w-5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {topFeeMerchants.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No fee contribution has been recorded yet.</div>
            ) : (
              topFeeMerchants.map((merchantStat, index) => {
                const merchant = merchantById.get(merchantStat.merchantId);
                const contribution = totalRevenue > 0 ? ((merchantStat._sum.feeAmount || 0) / totalRevenue) * 100 : 0;

                return (
                  <div key={merchantStat.merchantId} className="grid grid-cols-[32px_1fr_auto] items-center gap-4 p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{merchant?.businessName || "Unknown merchant"}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{merchant?.email || merchantStat.merchantId}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(contribution, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-slate-950 dark:text-white">+{formatSOL(merchantStat._sum.feeAmount)} SOL</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{merchantStat._count.id} paid tx</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminSurface>
      </div>

      <AdminSurface padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionHeader eyebrow="Fee ledger" title="Recent fee deposits" description="Latest platform fee entries from paid transactions." />
          <Link href="/admin/transactions?status=PAID" className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Paid ledger
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentFees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
              <Landmark className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Treasury is empty</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fee deposits will appear after paid transactions are confirmed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Source merchant</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Gross volume</th>
                  <th className="px-5 py-4">Net settlement</th>
                  <th className="px-5 py-4 text-right">Fee earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {recentFees.map((transaction) => (
                  <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatCompactDate(transaction.createdAt)}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950 dark:text-white">{transaction.merchant.businessName || "Unnamed merchant"}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{transaction.merchant.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{transaction.orderId}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">{formatSOL(transaction.amount)} SOL</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{formatSOL(transaction.netAmount)} SOL</td>
                    <td className="px-5 py-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatSOL(transaction.feeAmount)} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSurface>
    </div>
  );
}