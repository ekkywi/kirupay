import type { Metadata } from "next";
// src/app/(main)/admin/revenue/page.tsx
import prisma from "@/lib/neon";
import type { Prisma } from "@prisma/client";
import { formatCurrencyAverageBreakdown, formatCurrencyBreakdown } from "@/lib/currency-breakdown";
import { formatCurrencyDisplay } from "@/lib/currency-format";
import { buildPaymentCurrencyOptions } from "@/lib/payment-currencies";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Landmark,
  LineChart,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Users2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { DashboardSelect } from "@/components/dashboard/DashboardSelect";

export const metadata: Metadata = {
  title: "Admin Revenue",
};

const FEE_RATE = 0.003;

type AdminRevenueSearchParams = {
  currency?: string;
};

type CurrencyAggregateRow = {
  currency: string;
  _sum: {
    amount: number | null;
    feeAmount: number | null;
    netAmount: number | null;
  };
  _count: {
    id: number;
  };
};

type BusinessProfileRow = {
  id: string;
  name: string | null;
  contactEmail: string | null;
  _count: {
    memberships: number;
    activeMerchants: number;
  };
};

function formatCompactDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function sumByField(rows: CurrencyAggregateRow[], field: keyof CurrencyAggregateRow["_sum"]) {
  return rows.reduce((total, row) => total + (row._sum[field] ?? 0), 0);
}

function formatBusinessCoverage(activeMerchants: number, memberships: number) {
  if (memberships <= 0) return "No memberships";

  const coverage = (activeMerchants / memberships) * 100;
  return `${coverage.toFixed(0)}% coverage`;
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<AdminRevenueSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedRawCurrency = typeof resolvedSearchParams.currency === "string" ? resolvedSearchParams.currency.toUpperCase() : "ALL";

  const discoveredCurrencies = await prisma.transaction.findMany({
    where: { status: "PAID" },
    distinct: ["currency"],
    select: { currency: true },
    orderBy: { currency: "asc" },
  });

  const currencyOptions = buildPaymentCurrencyOptions(discoveredCurrencies.map((row) => row.currency));
  const selectedCurrency = currencyOptions.includes(selectedRawCurrency) ? selectedRawCurrency : "ALL";
  const currencyScope: Prisma.TransactionWhereInput = selectedCurrency === "ALL" ? {} : { currency: selectedCurrency };
  const paidWhere: Prisma.TransactionWhereInput = { status: "PAID", ...currencyScope };
  const feeWhere: Prisma.TransactionWhereInput = { ...paidWhere, feeAmount: { gt: 0 } };

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
    topBusinessTotals,
  ] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["currency"],
      where: paidWhere,
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...paidWhere, createdAt: { gte: startOfMonth } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...paidWhere, createdAt: { gte: startOfDay } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...paidWhere, createdAt: { gte: last7Days } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.count({ where: paidWhere }),
    prisma.transaction.findMany({
      where: feeWhere,
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        business: { select: { name: true, contactEmail: true } },
      },
    }),
    prisma.transaction.groupBy({
      by: ["businessId"],
      where: feeWhere,
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      orderBy: { _sum: { feeAmount: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenueAmount = sumByField(totalStats, "feeAmount");
  const totalVolumeAmount = sumByField(totalStats, "amount");
  const monthRevenueAmount = sumByField(monthStats, "feeAmount");
  const dayPaidCount = dayStats.reduce((total, row) => total + row._count.id, 0);
  const realizedFeeRate = totalVolumeAmount > 0 ? (totalRevenueAmount / totalVolumeAmount) * 100 : 0;
  const monthContribution = totalRevenueAmount > 0 ? (monthRevenueAmount / totalRevenueAmount) * 100 : 0;

  const topBusinessIds = topBusinessTotals.map((entry) => entry.businessId);
  const topBusinessBreakdownRows =
    topBusinessIds.length === 0
      ? []
      : await prisma.transaction.groupBy({
          by: ["businessId", "currency"],
          where: { ...feeWhere, businessId: { in: topBusinessIds } },
          _count: { id: true },
          _sum: { amount: true, feeAmount: true, netAmount: true },
          orderBy: { _sum: { feeAmount: "desc" } },
        });

  const topBusinessEntries = topBusinessTotals.map((entry) => {
    const feeRows = topBusinessBreakdownRows.filter((row) => row.businessId === entry.businessId).map((row) => ({
      currency: row.currency,
      _sum: {
        amount: row._sum.amount,
        feeAmount: row._sum.feeAmount,
        netAmount: row._sum.netAmount,
      },
      _count: { id: row._count.id },
    }));

    return {
      businessId: entry.businessId,
      feeRows,
      txCount: entry._count.id,
      totalFee: entry._sum.feeAmount || 0,
    };
  });

  const topBusinessProfiles = topBusinessIds.length === 0
    ? []
    : await prisma.businessEntity.findMany({
        where: { id: { in: topBusinessIds } },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          _count: { select: { memberships: true, activeMerchants: true } },
        },
      });

  const businessById = new Map<string, BusinessProfileRow>(topBusinessProfiles.map((business) => [business.id, business]));
  const auditLedgerHref = selectedCurrency === "ALL" ? "/admin/transactions" : `/admin/transactions?currency=${encodeURIComponent(selectedCurrency)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <Landmark className="h-4 w-4" />
            Treasury and revenue
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Platform earnings command center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track fee yield, treasury balance, business contribution, merchant participation, and recent revenue deposits from paid transactions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={auditLedgerHref} className="dashboard-secondary">
            Audit ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white opacity-80 dark:bg-white dark:text-slate-950">
            <ArrowDownToLine className="h-4 w-4" />
            Cold wallet queue
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Filter className="h-4 w-4" />
            Currency scope
          </div>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <DashboardSelect
              name="currency"
              defaultValue={selectedCurrency}
              variant="muted"
              options={[
                { value: "ALL", label: "All currencies" },
                ...currencyOptions.map((currency) => ({ value: currency, label: currency })),
              ]}
              className="w-full px-3 py-3 sm:min-w-[200px]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.07]"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </form>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: Landmark,
            label: "Total treasury",
            value: formatCurrencyBreakdown(totalStats, "feeAmount"),
            detail: `${paidTransactionCount} paid fee events`,
            tone: "emerald",
          },
          {
            icon: CalendarDays,
            label: "This month",
            value: formatCurrencyBreakdown(monthStats, "feeAmount"),
            detail: `${monthContribution.toFixed(1)}% of all-time fees`,
            tone: "blue",
          },
          {
            icon: Banknote,
            label: "Today",
            value: formatCurrencyBreakdown(dayStats, "feeAmount"),
            detail: `${dayPaidCount} paid transactions`,
            tone: "emerald",
          },
          {
            icon: TrendingUp,
            label: "Realized fee rate",
            value: `${realizedFeeRate.toFixed(2)}%`,
            detail: `target ${(FEE_RATE * 100).toFixed(1)}% platform fee`,
            tone: Math.abs(realizedFeeRate - FEE_RATE * 100) < 0.05 || totalVolumeAmount === 0 ? "emerald" : "amber",
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
                { label: "7-day fees", value: formatCurrencyBreakdown(weeklyStats, "feeAmount"), icon: Clock3 },
                { label: "7-day volume", value: formatCurrencyBreakdown(weeklyStats, "amount"), icon: TrendingUp },
                { label: "Net settled", value: formatCurrencyBreakdown(weeklyStats, "netAmount"), icon: WalletCards },
                { label: "Avg fee", value: formatCurrencyAverageBreakdown(totalStats, "feeAmount"), icon: Receipt },
              ].map((item) => (
                <div key={item.label} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <item.icon className="mb-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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

        <div className="space-y-6">
          <AdminSurface padded={false}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
              <AdminSectionHeader
                eyebrow="Business contribution"
                title="Top business contributors"
                description="Fee revenue is calculated from confirmed paid transactions in the current currency scope."
              />
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {topBusinessEntries.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No fee contribution has been recorded yet.</div>
              ) : (
                topBusinessEntries.map((entry, index) => {
                  const business = businessById.get(entry.businessId);
                  const contribution = totalRevenueAmount > 0 ? (entry.totalFee / totalRevenueAmount) * 100 : 0;
                  const feeBreakdown = formatCurrencyBreakdown(entry.feeRows, "feeAmount");
                  const avgFeeBreakdown = formatCurrencyAverageBreakdown(entry.feeRows, "feeAmount");
                  const activeMerchants = business?._count.activeMerchants ?? 0;
                  const memberships = business?._count.memberships ?? 0;

                  return (
                    <div key={entry.businessId} className="grid grid-cols-[32px_1fr_auto] items-center gap-4 p-5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{business?.name || "Unknown business"}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          {business?.contactEmail || entry.businessId}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          {entry.txCount} fee events
                          {avgFeeBreakdown !== "-" ? ` • Avg ${avgFeeBreakdown}` : ""}
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(contribution, 100)}%` }} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-slate-950 dark:text-white">{feeBreakdown}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{formatBusinessCoverage(activeMerchants, memberships)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AdminSurface>

          <AdminSurface>
            <div className="flex items-start gap-3">
              <Users2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Merchant participation</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Merchant counts here are participation context for the businesses driving treasury activity, not direct fee attribution by merchant.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {topBusinessEntries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No merchant participation data is available yet.</p>
              ) : (
                topBusinessEntries.map((entry, index) => {
                  const business = businessById.get(entry.businessId);
                  const activeMerchants = business?._count.activeMerchants ?? 0;
                  const memberships = business?._count.memberships ?? 0;
                  const coverage = memberships > 0 ? (activeMerchants / memberships) * 100 : 0;

                  return (
                    <div key={entry.businessId} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {index + 1}. {business?.name || "Unknown business"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {activeMerchants} active merchants • {memberships} memberships
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-slate-950 dark:text-white">{coverage.toFixed(0)}%</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">coverage</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AdminSurface>
        </div>
      </div>

      <AdminSurface padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionHeader
            eyebrow="Fee ledger"
            title="Recent fee deposits"
            description="Latest platform fee entries from paid transactions."
          />
          <Link
            href={auditLedgerHref}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.06]"
          >
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
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="dashboard-table-head">
                <tr>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Source business</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Currency</th>
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
                      <p className="font-semibold text-slate-950 dark:text-white">{transaction.business.name || "Unnamed business"}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {transaction.business.contactEmail || "No contact email"}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{transaction.orderId}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                        {transaction.currency}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {formatCurrencyDisplay(transaction.currency, transaction.amount)}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrencyDisplay(transaction.currency, transaction.netAmount)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrencyDisplay(transaction.currency, transaction.feeAmount)}
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
