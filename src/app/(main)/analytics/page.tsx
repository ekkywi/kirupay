import type { Metadata } from "next";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";
import { StatusDonutChart } from "@/components/dashboard/analytics/StatusDonutChart";
import { TopCustomersTable } from "@/components/dashboard/analytics/TopCustomersTable";
import { RevenueSourceChart } from "@/components/dashboard/analytics/RevenueSourceChart";
import { HistoricalVolumeChart } from "@/components/dashboard/analytics/HistoricalVolumeChart";
import { PeakHoursChart } from "@/components/dashboard/analytics/PeakHoursChart";
import { formatCurrencyDisplay } from "@/lib/currency-format";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Radio,
  ReceiptText,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Analytics",
};

type HistoricalRow = {
  month: string;
  status: string;
  count: bigint | number;
};

type PeakHourRow = {
  hour: bigint | number;
  count: bigint | number;
};

type CountRow = {
  count: bigint | number;
};

type HistoryPoint = {
  month: string;
  PAID: number;
  PENDING: number;
  FAILED: number;
};

type TransactionStatus = "PAID" | "PENDING" | "FAILED";
type CurrencyView = "ALL" | string;

type MonetarySummary = {
  gross: number;
  fee: number;
  net: number;
  avgOrderValue: number;
  paidCount: number;
};

type TopCustomerView = {
  displayName: string;
  customerEmail: string | null;
  buyerWallet: string | null;
  totalOrders: number;
  totalsByCurrency: Record<string, number>;
};

type TrendSnapshot = {
  label: string;
  gross: number;
  fee: number;
  net: number;
  paidCount: number;
  totalCount: number;
  successRate: number;
};

type CurrencyAggregateRow = {
  currency: string;
  _sum: { amount: number | null; feeAmount: number | null; netAmount: number | null };
  _avg: { amount: number | null };
  _count: { id: number };
};

const CURRENCY_SERIES_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

function percentDelta(current: number, previous: number) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  if (current > 0) return 100;
  return 0;
}

function moneyWhere(base: Prisma.TransactionWhereInput, currency: CurrencyView): Prisma.TransactionWhereInput {
  if (currency === "ALL") return base;
  return { ...base, currency };
}

function formatMultiCurrencyTotals(rows: CurrencyAggregateRow[], field: keyof CurrencyAggregateRow["_sum"]) {
  const entries = rows
    .map((row) => {
      const value = row._sum[field] ?? 0;
      return value > 0 ? formatCurrencyDisplay(row.currency, value) : null;
    })
    .filter((value): value is string => Boolean(value));

  if (entries.length === 0) return "-";
  return entries.join(" • ");
}

function formatMultiCurrencyDelta(currentRows: CurrencyAggregateRow[], previousRows: CurrencyAggregateRow[], field: keyof CurrencyAggregateRow["_sum"]) {
  const previousByCurrency = new Map(previousRows.map((row) => [row.currency, row._sum[field] ?? 0]));
  const entries = currentRows
    .map((row) => {
      const currentValue = row._sum[field] ?? 0;
      if (currentValue <= 0) return null;

      const delta = percentDelta(currentValue, previousByCurrency.get(row.currency) ?? 0);
      return `${row.currency} ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
    })
    .filter((value): value is string => Boolean(value));

  if (entries.length === 0) return "No paid volume in this period";
  return `${entries.join(" • ")} vs previous period`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const business = ctx.business;

  const params = await searchParams;
  const selectedRaw = typeof params.currency === "string" ? params.currency.toUpperCase() : "ALL";

  const discoveredCurrencies = await prisma.transaction.findMany({
    where: { businessId: business.id },
    distinct: ["currency"],
    select: { currency: true },
    orderBy: { currency: "asc" },
  });

  const currencyTabs = ["ALL", ...discoveredCurrencies.map((row) => row.currency)] as CurrencyView[];
  const selectedCurrency: CurrencyView = currencyTabs.includes(selectedRaw) ? selectedRaw : "ALL";

  const baseWhere: Prisma.TransactionWhereInput = { businessId: business.id };
  const scopedWhere = moneyWhere(baseWhere, selectedCurrency);

  const now = new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const current7dStart = new Date(now.getTime() - sevenDaysMs);
  const previous7dStart = new Date(now.getTime() - (sevenDaysMs * 2));
  const current30dStart = new Date(now.getTime() - thirtyDaysMs);
  const previous30dStart = new Date(now.getTime() - (thirtyDaysMs * 2));

  const scopedSql = selectedCurrency === "ALL"
    ? Prisma.sql`WHERE "businessId" = ${business.id}`
    : Prisma.sql`WHERE "businessId" = ${business.id} AND currency = ${selectedCurrency}`;

  const [
    statusDistribution,
    topCustomersRaw,
    totalStats,
    historicalRaw,
    peakHoursRaw,
    sourceDistribution,
    settlementStats,
    webhookStats,
    failedWebhookCount,
    stalePendingRaw,
    sourceFunnel,
    paidByCurrency,
    paidCurrent7d,
    paidPrevious7d,
    paidCurrent30d,
    paidPrevious30d,
    paidCurrent7dByCurrency,
    paidPrevious7dByCurrency,
    paidCurrent30dByCurrency,
    paidPrevious30dByCurrency,
    allCurrent7d,
    allPrevious7d,
    allCurrent30d,
    allPrevious30d,
  ] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["status"],
      where: scopedWhere,
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ["customerEmail", "buyerWallet", "currency"],
      where: { ...scopedWhere, status: "PAID" },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 150,
    }),
    prisma.transaction.aggregate({
      where: scopedWhere,
      _count: { id: true },
      _sum: { netAmount: true },
    }),
    prisma.$queryRaw`
      SELECT
        to_char("createdAt", 'Mon YYYY') as month,
        status,
        COUNT(id) as count
      FROM "Transaction"
      ${scopedSql}
      GROUP BY 1, 2
      ORDER BY MIN("createdAt") ASC
    `,
    prisma.$queryRaw`
      SELECT
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(id) as count
      FROM "Transaction"
      ${scopedSql} AND status = 'PAID'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.transaction.groupBy({
      by: ["source"],
      where: { ...scopedWhere, status: "PAID" },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { ...scopedWhere, status: "PAID" },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
    }),
    prisma.webhookLog.aggregate({
      where: { businessId: business.id },
      _count: { id: true },
    }),
    prisma.webhookLog.count({
      where: {
        businessId: business.id,
        OR: [{ status: null }, { status: { lt: 200 } }, { status: { gte: 300 } }],
      },
    }),
    prisma.$queryRaw`
      SELECT COUNT(id) as count
      FROM "Transaction"
      ${scopedSql}
        AND status = 'PENDING'
        AND "createdAt" < NOW() - INTERVAL '24 hours'
    `,
    prisma.transaction.groupBy({
      by: ["source", "status"],
      where: scopedWhere,
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID" },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { ...scopedWhere, status: "PAID", createdAt: { gte: current7dStart, lt: now } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { ...scopedWhere, status: "PAID", createdAt: { gte: previous7dStart, lt: current7dStart } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { ...scopedWhere, status: "PAID", createdAt: { gte: current30dStart, lt: now } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { ...scopedWhere, status: "PAID", createdAt: { gte: previous30dStart, lt: current30dStart } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID", createdAt: { gte: current7dStart, lt: now } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID", createdAt: { gte: previous7dStart, lt: current7dStart } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID", createdAt: { gte: current30dStart, lt: now } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { ...baseWhere, status: "PAID", createdAt: { gte: previous30dStart, lt: current30dStart } },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      _avg: { amount: true },
      _count: { id: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.count({ where: { ...scopedWhere, createdAt: { gte: current7dStart, lt: now } } }),
    prisma.transaction.count({ where: { ...scopedWhere, createdAt: { gte: previous7dStart, lt: current7dStart } } }),
    prisma.transaction.count({ where: { ...scopedWhere, createdAt: { gte: current30dStart, lt: now } } }),
    prisma.transaction.count({ where: { ...scopedWhere, createdAt: { gte: previous30dStart, lt: current30dStart } } }),
  ]);

  const donutData = statusDistribution.map((item) => ({
    name: item.status,
    value: item._count.id,
  }));

  const sourceData = sourceDistribution.map((item, index) => ({
    name: item.source === "API" ? "API Integration" : "Payment Links",
    value: Number(item._count.id),
    color: CURRENCY_SERIES_COLORS[index % CURRENCY_SERIES_COLORS.length],
  }));

  const topCustomerMap = new Map<string, TopCustomerView>();
  for (const row of topCustomersRaw) {
    const key = `${row.customerEmail ?? ""}::${row.buyerWallet ?? ""}`;
    const existing = topCustomerMap.get(key) ?? {
      displayName: row.customerEmail || (row.buyerWallet ? `${row.buyerWallet.slice(0, 6)}...${row.buyerWallet.slice(-4)}` : "Anonymous Wallet"),
      customerEmail: row.customerEmail,
      buyerWallet: row.buyerWallet,
      totalOrders: 0,
      totalsByCurrency: {},
    };

    existing.totalOrders += row._count.id;
    existing.totalsByCurrency[row.currency] = (existing.totalsByCurrency[row.currency] ?? 0) + (row._sum.amount ?? 0);
    topCustomerMap.set(key, existing);
  }

  const formattedTopCustomers = Array.from(topCustomerMap.values())
    .sort((a, b) => {
      const aGross = Object.values(a.totalsByCurrency).reduce((sum, val) => sum + val, 0);
      const bGross = Object.values(b.totalsByCurrency).reduce((sum, val) => sum + val, 0);
      return bGross - aGross;
    })
    .slice(0, 5);

  const paidCount = donutData.find((d) => d.name === "PAID")?.value || 0;
  const pendingCount = donutData.find((d) => d.name === "PENDING")?.value || 0;
  const failedCount = donutData.find((d) => d.name === "FAILED")?.value || 0;

  const abandonedRate = totalStats._count.id > 0 ? (pendingCount / totalStats._count.id) * 100 : 0;
  const successRate = totalStats._count.id > 0 ? (paidCount / totalStats._count.id) * 100 : 0;

  const grossVolume = settlementStats._sum.amount || 0;
  const feeVolume = settlementStats._sum.feeAmount || 0;
  const netVolume = settlementStats._sum.netAmount || 0;
  const avgOrderValue = settlementStats._avg.amount || 0;

  const webhookTotal = webhookStats._count.id;
  const webhookSuccessRate = webhookTotal > 0 ? ((webhookTotal - failedWebhookCount) / webhookTotal) * 100 : 100;
  const stalePendingCount = Number((stalePendingRaw as CountRow[])[0]?.count || 0);
  const walletConnected = !(business.settlementWallet?.walletAddress || "pending").includes("pending");

  const topCustomerGross = formattedTopCustomers.reduce(
    (sum, customer) => sum + Object.values(customer.totalsByCurrency).reduce((inner, val) => inner + val, 0),
    0
  );
  const customerConcentration = grossVolume > 0 ? (topCustomerGross / grossVolume) * 100 : 0;
  const concentrationLevel = customerConcentration >= 60 ? "High" : customerConcentration >= 35 ? "Medium" : "Low";

  const sourceSummary = sourceFunnel.reduce<Record<string, { total: number; paid: number }>>((acc, item) => {
    const source = item.source === "API" ? "API" : "Payment Links";
    acc[source] ??= { total: 0, paid: 0 };
    acc[source].total += item._count.id;
    if (item.status === "PAID") acc[source].paid += item._count.id;
    return acc;
  }, {});

  const funnelSteps = [
    { label: "Checkout created", value: totalStats._count.id, tone: "blue" },
    { label: "Paid", value: paidCount, tone: "emerald" },
    { label: "Pending", value: pendingCount, tone: "amber" },
    { label: "Failed", value: failedCount, tone: "red" },
  ];

  const historyMap = new Map<string, HistoryPoint>();
  (historicalRaw as HistoricalRow[]).forEach((row) => {
    const month = row.month;
    if (!historyMap.has(month)) historyMap.set(month, { month, PAID: 0, PENDING: 0, FAILED: 0 });
    const status = row.status as TransactionStatus;
    const historyPoint = historyMap.get(month);
    if (historyPoint && status in historyPoint) historyPoint[status] = Number(row.count);
  });
  const historicalData = Array.from(historyMap.values());

  const peakHoursData = Array.from({ length: 24 }).map((_, i) => ({ hour: i.toString().padStart(2, "0"), count: 0 }));
  (peakHoursRaw as PeakHourRow[]).forEach((row) => {
    const hourIdx = Number(row.hour);
    peakHoursData[hourIdx].count = Number(row.count);
  });
  const peakHour = peakHoursData.reduce((top, item) => (item.count > top.count ? item : top), peakHoursData[0]);

  const strongestSource = Object.entries(sourceSummary).sort((a, b) => b[1].paid - a[1].paid)[0];

  const paidSummaryByCurrency: Record<string, MonetarySummary> = paidByCurrency.reduce((acc, item) => {
    acc[item.currency] = {
      gross: item._sum.amount ?? 0,
      fee: item._sum.feeAmount ?? 0,
      net: item._sum.netAmount ?? 0,
      avgOrderValue: item._avg.amount ?? 0,
      paidCount: item._count.id,
    };
    return acc;
  }, {} as Record<string, MonetarySummary>);

  const activeMonetarySummary: MonetarySummary = selectedCurrency === "ALL"
    ? {
      gross: grossVolume,
      fee: feeVolume,
      net: netVolume,
      avgOrderValue: avgOrderValue,
      paidCount,
    }
    : (paidSummaryByCurrency[selectedCurrency] ?? { gross: 0, fee: 0, net: 0, avgOrderValue: 0, paidCount: 0 });

  const buildTrend = (
    label: string,
    paidAgg: { _sum: { amount: number | null; feeAmount: number | null; netAmount: number | null }; _count: { id: number } },
    totalCount: number
  ): TrendSnapshot => {
    const paidCountSnapshot = paidAgg._count.id;
    return {
      label,
      gross: paidAgg._sum.amount ?? 0,
      fee: paidAgg._sum.feeAmount ?? 0,
      net: paidAgg._sum.netAmount ?? 0,
      paidCount: paidCountSnapshot,
      totalCount,
      successRate: totalCount > 0 ? (paidCountSnapshot / totalCount) * 100 : 0,
    };
  };

  const trend7Current = buildTrend("Last 7 days", paidCurrent7d, allCurrent7d);
  const trend7Previous = buildTrend("Previous 7 days", paidPrevious7d, allPrevious7d);
  const trend30Current = buildTrend("Last 30 days", paidCurrent30d, allCurrent30d);
  const trend30Previous = buildTrend("Previous 30 days", paidPrevious30d, allPrevious30d);

  const trend7Value = selectedCurrency === "ALL"
    ? formatMultiCurrencyTotals(paidCurrent7dByCurrency as CurrencyAggregateRow[], "netAmount")
    : formatCurrencyDisplay(selectedCurrency, trend7Current.net);
  const trend30Value = selectedCurrency === "ALL"
    ? formatMultiCurrencyTotals(paidCurrent30dByCurrency as CurrencyAggregateRow[], "netAmount")
    : formatCurrencyDisplay(selectedCurrency, trend30Current.net);
  const trend7DeltaLabel = selectedCurrency === "ALL"
    ? formatMultiCurrencyDelta(
      paidCurrent7dByCurrency as CurrencyAggregateRow[],
      paidPrevious7dByCurrency as CurrencyAggregateRow[],
      "netAmount"
    )
    : `${percentDelta(trend7Current.net, trend7Previous.net) >= 0 ? "+" : ""}${percentDelta(trend7Current.net, trend7Previous.net).toFixed(1)}% vs previous period`;
  const trend30DeltaLabel = selectedCurrency === "ALL"
    ? formatMultiCurrencyDelta(
      paidCurrent30dByCurrency as CurrencyAggregateRow[],
      paidPrevious30dByCurrency as CurrencyAggregateRow[],
      "netAmount"
    )
    : `${percentDelta(trend30Current.net, trend30Previous.net) >= 0 ? "+" : ""}${percentDelta(trend30Current.net, trend30Previous.net).toFixed(1)}% vs previous period`;

  const trendCards = [
    {
      label: "7-day net",
      value: trend7Value,
      delta: percentDelta(trend7Current.net, trend7Previous.net),
      deltaLabel: trend7DeltaLabel,
    },
    {
      label: "30-day net",
      value: trend30Value,
      delta: percentDelta(trend30Current.net, trend30Previous.net),
      deltaLabel: trend30DeltaLabel,
    },
    {
      label: "7-day success",
      value: `${trend7Current.successRate.toFixed(1)}%`,
      delta: percentDelta(trend7Current.successRate, trend7Previous.successRate),
      deltaLabel: `${percentDelta(trend7Current.successRate, trend7Previous.successRate) >= 0 ? "+" : ""}${percentDelta(trend7Current.successRate, trend7Previous.successRate).toFixed(1)}% vs previous period`,
    },
    {
      label: "30-day success",
      value: `${trend30Current.successRate.toFixed(1)}%`,
      delta: percentDelta(trend30Current.successRate, trend30Previous.successRate),
      deltaLabel: `${percentDelta(trend30Current.successRate, trend30Previous.successRate) >= 0 ? "+" : ""}${percentDelta(trend30Current.successRate, trend30Previous.successRate).toFixed(1)}% vs previous period`,
    },
  ];

  const activeCurrencyLabel = selectedCurrency === "ALL" ? "All currencies" : selectedCurrency;
  const activeNetInsight = selectedCurrency === "ALL"
    ? `${formatMultiCurrencyTotals(paidByCurrency as CurrencyAggregateRow[], "netAmount")} (mixed by currency)`
    : formatCurrencyDisplay(selectedCurrency, activeMonetarySummary.net);
  const insightSummary = [
    paidCount > 0
      ? `Net settlement is ${activeNetInsight} from ${paidCount} paid transactions.`
      : "No paid settlement yet. Create payment links or API checkout sessions to start collecting.",
    peakHour.count > 0
      ? `Highest paid activity is around ${peakHour.hour}:00 with ${peakHour.count} paid checkout${peakHour.count === 1 ? "" : "s"}.`
      : "Peak hour insight will appear after paid transactions are recorded.",
    strongestSource
      ? `${strongestSource[0]} currently leads paid checkout volume with ${strongestSource[1].paid} paid order${strongestSource[1].paid === 1 ? "" : "s"}.`
      : "Source performance will appear once checkout sessions or payment links are used.",
    webhookTotal > 0
      ? `Webhook delivery health is ${webhookSuccessRate.toFixed(1)}% across ${webhookTotal} event${webhookTotal === 1 ? "" : "s"}.`
      : "Webhook health is ready, but no webhook deliveries have been logged yet.",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="dashboard-header flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="h-4 w-4" />
            Analytics center
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Payment intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Understand revenue quality, customer concentration, source mix, and payment behavior.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currencyTabs.map((currency) => {
              const isActive = currency === selectedCurrency;
              return (
                <Link
                  key={currency}
                  href={currency === "ALL" ? "/analytics" : `/analytics?currency=${encodeURIComponent(currency)}`}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {currency}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/payments" className="dashboard-secondary">
            View ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/payment-links" className="dashboard-primary">
            Create payment link
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="dashboard-card p-5">
          <TrendingUp className="mb-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total net revenue</p>
          <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">
            {selectedCurrency === "ALL"
              ? "Per currency"
              : formatCurrencyDisplay(selectedCurrency, totalStats._sum.netAmount ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeCurrencyLabel} · after platform fee</p>
        </div>
        <div className="dashboard-card p-5">
          <Target className="mb-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total orders</p>
          <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{totalStats._count.id}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{paidCount} paid transactions</p>
        </div>
        <div className="dashboard-card p-5">
          <Activity className="mb-4 h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Success / Pending</p>
          <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{successRate.toFixed(1)}% / {abandonedRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Paid ratio vs pending checkout</p>
        </div>
        <div className="dashboard-card p-5">
          <Clock3 className="mb-4 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">View mode</p>
          <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{activeCurrencyLabel}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Switch tabs to compare currency performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trendCards.map((card) => (
          <div key={card.label} className="dashboard-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-2 font-mono text-lg font-semibold text-slate-950 dark:text-white">{card.value}</p>
            <p className={`mt-1 text-xs font-semibold ${card.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {card.deltaLabel}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <ReceiptText className="h-4 w-4" />
                Settlement intelligence
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Finance-ready settlement math</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gross, fee, net, and average order value from paid transactions.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{activeCurrencyLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Gross volume", value: selectedCurrency === "ALL" ? "Mixed" : formatCurrencyDisplay(selectedCurrency, activeMonetarySummary.gross) },
              { label: "Platform fee", value: selectedCurrency === "ALL" ? "Mixed" : formatCurrencyDisplay(selectedCurrency, activeMonetarySummary.fee) },
              { label: "Net settlement", value: selectedCurrency === "ALL" ? "Mixed" : formatCurrencyDisplay(selectedCurrency, activeMonetarySummary.net) },
              { label: "Avg order value", value: selectedCurrency === "ALL" ? "Mixed" : formatCurrencyDisplay(selectedCurrency, activeMonetarySummary.avgOrderValue) },
            ].map((item) => (
              <div key={item.label} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 font-mono text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
          {selectedCurrency === "ALL" && Object.keys(paidSummaryByCurrency).length > 0 ? (
            <div className="mt-4 space-y-2">
              {Object.entries(paidSummaryByCurrency).map(([currency, summary]) => (
                <div key={currency} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{currency}</span>
                  <span className="font-mono text-slate-950 dark:text-white">{formatCurrencyDisplay(currency, summary.net)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dashboard-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <Target className="h-4 w-4" />
                Conversion funnel
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Checkout completion quality</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track where payment intent turns into confirmed settlement.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{successRate.toFixed(1)}% paid</span>
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step) => {
              const width = totalStats._count.id > 0 ? Math.max((step.value / totalStats._count.id) * 100, step.value > 0 ? 6 : 0) : 0;
              const colorClass = step.tone === "emerald" ? "bg-emerald-500" : step.tone === "amber" ? "bg-amber-500" : step.tone === "red" ? "bg-red-500" : "bg-emerald-500";
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
                    <span className="font-mono text-slate-950 dark:text-white">{step.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(sourceSummary).map(([source, values]) => (
              <div key={source} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{source}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{values.total > 0 ? ((values.paid / values.total) * 100).toFixed(1) : "0.0"}% conversion</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <Radio className="h-4 w-4" />
                Operational health
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Integration reliability snapshot</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Webhook delivery, stale pending records, and settlement wallet readiness.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${walletConnected ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
              {walletConnected ? "Wallet connected" : "Wallet pending"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Radio, label: "Webhook success", value: `${webhookSuccessRate.toFixed(1)}%`, detail: `${failedWebhookCount} failed` },
              { icon: Clock3, label: "Stale pending", value: stalePendingCount.toString(), detail: "older than 24h" },
              { icon: Wallet, label: "Settlement wallet", value: walletConnected ? "Ready" : "Action needed", detail: walletConnected ? "can receive payments" : "connect wallet" },
            ].map((item) => (
              <div key={item.label} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <Lightbulb className="h-4 w-4" />
                Insight summary
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Actionable readout</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Rule-based highlights generated from current merchant data.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${concentrationLevel === "High" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : concentrationLevel === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
              {concentrationLevel} concentration
            </span>
          </div>
          <div className="space-y-3">
            {insightSummary.map((insight) => (
              <div key={insight} className="flex gap-3 dashboard-muted-panel p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="font-semibold text-slate-950 dark:text-white text-base">Transaction success ratio</h3>
          <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">Distribution of paid, pending, and failed records.</p>
          <StatusDonutChart data={donutData} title={activeCurrencyLabel} />
        </div>
        <div className="dashboard-card p-6">
          <h3 className="font-semibold text-slate-950 dark:text-white text-base">Orders by source</h3>
          <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">Compare API checkout sessions against manual payment links.</p>
          <RevenueSourceChart data={sourceData} />
        </div>
      </div>

      <div className="dashboard-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Historical volume and drop-off</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly comparison by transaction status.</p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">Monthly status comparison</span>
        </div>
        <HistoricalVolumeChart data={historicalData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 dashboard-card p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white text-base">Peak buying hours</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid checkout concentration by hour.</p>
            </div>
            <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <PeakHoursChart data={peakHoursData} peakHour={peakHour.hour} />
        </div>
        <div className="lg:col-span-5 dashboard-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Top spending customers</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Highest gross volume by email or wallet.</p>
          </div>
          <TopCustomersTable customers={formattedTopCustomers} selectedCurrency={selectedCurrency} />
        </div>
      </div>
    </div>
  );
}
