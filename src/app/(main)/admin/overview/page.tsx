import type { Metadata } from "next";
// src/app/(main)/admin/overview/page.tsx
import prisma from "@/lib/neon";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  DatabaseZap,
  Landmark,
  Radio,
  ReceiptText,
  Server,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";

export const metadata: Metadata = {
  title: "Admin Overview",
};

const formatSOL = (value: number | null | undefined, precision = 4) => (value ?? 0).toFixed(precision);

function formatCompactDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getStatusClasses(status: string) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  if (status === "FAILED") {
    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  }

  return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    paidStats,
    dailyStats,
    weeklyStats,
    totalTransactions,
    pendingCount,
    failedCount,
    totalMerchants,
    activeMerchants,
    verifiedMerchants,
    walletConnectedMerchants,
    webhookConfiguredBusinesses,
    webhookTotal,
    webhookFailed,
    recentTransactions,
    recentMerchants,
    topMerchantStats,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: last24Hours } },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: last7Days } },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true },
    }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.transaction.count({ where: { status: "FAILED" } }),
    prisma.businessEntity.count(),
    prisma.businessEntity.count({ where: { isActive: true } }),
    prisma.businessMembership.count({ where: { role: "OWNER", merchant: { emailVerified: true } } }),
    prisma.businessWalletIdentity.count({ where: { isActive: true, walletAddress: { not: { contains: "pending" } } } }),
    prisma.businessCredential.count({ where: { webhookUrl: { not: null } } }),
    prisma.webhookLog.count(),
    prisma.webhookLog.count({ where: { OR: [{ status: null }, { status: { not: 200 } }] } }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        business: { select: { name: true, contactEmail: true } },
      },
    }),
    prisma.businessEntity.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        contactEmail: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ["businessId"],
      where: { status: "PAID" },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  const topMerchantProfiles = await prisma.businessEntity.findMany({
    where: { id: { in: topMerchantStats.map((item) => item.businessId) } },
    select: { id: true, name: true, contactEmail: true },
  });

  const merchantProfileById = new Map(topMerchantProfiles.map((merchant) => [merchant.id, merchant]));
  const paidCount = paidStats._count.id;
  const totalVolume = paidStats._sum.amount || 0;
  const totalFees = paidStats._sum.feeAmount || 0;
  const dailyVolume = dailyStats._sum.amount || 0;
  const dailyFees = dailyStats._sum.feeAmount || 0;
  const weeklyVolume = weeklyStats._sum.amount || 0;
  const conversionRate = totalTransactions > 0 ? (paidCount / totalTransactions) * 100 : 0;
  const activeMerchantRate = totalMerchants > 0 ? (activeMerchants / totalMerchants) * 100 : 0;
  const webhookFailureRate = webhookTotal > 0 ? (webhookFailed / webhookTotal) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldCheck className="h-4 w-4" />
            Administrator overview
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Platform command center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor global volume, platform revenue, merchant readiness, and transaction health across Trezalink.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/transactions" className="dashboard-secondary">
            Global ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/revenue" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
            Treasury
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: Landmark,
            label: "Platform treasury",
            value: `${formatSOL(totalFees)} SOL`,
            detail: `+${formatSOL(dailyFees)} SOL last 24h`,
            tone: "emerald",
          },
          {
            icon: Activity,
            label: "Paid volume",
            value: `${formatSOL(totalVolume)} SOL`,
            detail: `${formatSOL(dailyVolume)} SOL last 24h`,
            tone: "blue",
          },
          {
            icon: Users,
            label: "Merchants",
            value: totalMerchants.toString(),
            detail: `${activeMerchantRate.toFixed(0)}% active accounts`,
            tone: "red",
          },
          {
            icon: ReceiptText,
            label: "Payment success",
            value: `${conversionRate.toFixed(1)}%`,
            detail: `${pendingCount} pending, ${failedCount} failed`,
            tone: conversionRate >= 80 ? "emerald" : "amber",
          },
        ].map((metric) => (
          <AdminMetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone as "blue" | "emerald" | "amber" | "red"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSurface padded={false}>
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <AdminSectionHeader eyebrow="Network ledger" title="Latest global transactions" />
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Radio className="h-3.5 w-3.5" />
              10 latest events
            </span>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No network activity</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Global transactions will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="dashboard-table-head">
                  <tr>
                    <th className="px-5 py-4">Merchant</th>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Gross</th>
                    <th className="px-5 py-4">Fee</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Time</th>
                    <th className="px-5 py-4 text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950 dark:text-white">{transaction.business.name || "Unnamed merchant"}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{transaction.business.contactEmail}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{transaction.orderId}</td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">{formatSOL(transaction.amount)} SOL</td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatSOL(transaction.feeAmount)} SOL
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(transaction.status)}`}>{transaction.status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatCompactDate(transaction.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={transaction.txSignature ? `https://explorer.solana.com/tx/${transaction.txSignature}?cluster=devnet` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex rounded-lg p-2 transition-colors ${
                            transaction.txSignature
                              ? "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                              : "cursor-not-allowed text-slate-300 dark:text-slate-700"
                          }`}
                          title={transaction.txSignature ? "View on Solana Explorer" : "No signature yet"}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSurface>

        <div className="space-y-6">
          <div className="dashboard-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">Operating health</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Readiness signals</h2>
              </div>
              <Server className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 space-y-4">
              {[
                { label: "Verified merchants", value: `${verifiedMerchants}/${totalMerchants}`, detail: "email verified", ok: verifiedMerchants === totalMerchants && totalMerchants > 0 },
                { label: "Wallet connected", value: `${walletConnectedMerchants}/${totalMerchants}`, detail: "can receive SOL", ok: walletConnectedMerchants === totalMerchants && totalMerchants > 0 },
                { label: "Webhook configured", value: `${webhookConfiguredBusinesses}/${totalMerchants}`, detail: "event delivery ready", ok: webhookConfiguredBusinesses === totalMerchants && totalMerchants > 0 },
                { label: "Webhook failure rate", value: `${webhookFailureRate.toFixed(1)}%`, detail: `${webhookFailed}/${webhookTotal} failed`, ok: webhookFailureRate < 5 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                    {item.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">7-day platform pulse</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Volume", value: `${formatSOL(weeklyVolume)} SOL`, icon: TrendingUp },
                { label: "Paid count", value: weeklyStats._count.id.toString(), icon: ReceiptText },
                { label: "Fee yield", value: `${formatSOL(weeklyStats._sum.feeAmount)} SOL`, icon: Landmark },
                { label: "Total tx", value: totalTransactions.toString(), icon: DatabaseZap },
              ].map((item) => (
                <div key={item.label} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <item.icon className="mb-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="dashboard-card">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Merchant growth</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Newest merchants</h2>
            </div>
            <Link href="/admin/merchants" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.06]">
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {recentMerchants.map((business) => (
              <div key={business.id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{business.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{business.contactEmail || business.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${business.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                    {business.isActive ? "Active" : "Paused"}
                  </span>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{formatCompactDate(business.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Revenue concentration</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Top merchants by volume</h2>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {topMerchantStats.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No paid merchant volume yet.</div>
            ) : (
              topMerchantStats.map((merchantStat, index) => {
                const merchant = merchantProfileById.get(merchantStat.businessId);

                return (
                  <div key={merchantStat.businessId} className="grid grid-cols-[32px_1fr_auto] items-center gap-4 p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{merchant?.name || "Unknown business"}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{merchant?.contactEmail || merchantStat.businessId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-slate-950 dark:text-white">{formatSOL(merchantStat._sum.amount)} SOL</p>
                      <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">+{formatSOL(merchantStat._sum.feeAmount)} SOL fee</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
