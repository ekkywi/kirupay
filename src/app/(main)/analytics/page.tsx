import type { Metadata } from "next";
// src/app/dashboard/analytics/page.tsx
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";
import { StatusDonutChart } from "@/components/dashboard/analytics/StatusDonutChart";
import { TopCustomersTable } from "@/components/dashboard/analytics/TopCustomersTable";
import { RevenueSourceChart } from "@/components/dashboard/analytics/RevenueSourceChart";
import { HistoricalVolumeChart } from "@/components/dashboard/analytics/HistoricalVolumeChart";
import { PeakHoursChart } from "@/components/dashboard/analytics/PeakHoursChart";
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

export default async function AnalyticsPage() {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const merchant = ctx.merchant;
  const business = ctx.business;

  const [
    statusDistribution, 
    topCustomers, 
    totalStats,
    historicalRaw,
    peakHoursRaw,
    sourceDistribution,
    settlementStats,
    webhookStats,
    failedWebhookCount,
    stalePendingRaw,
    sourceFunnel,
  ] = await Promise.all([
    // 1. Distribusi Status (Donut Chart)
    prisma.transaction.groupBy({
      by: ['status'],
      where: { businessId: business.id },
      _count: { id: true },
    }),

    // 2. Pelanggan Teratas (Leaderboard)
    prisma.transaction.groupBy({
      by: ['customerEmail', 'buyerWallet'], 
      where: { businessId: business.id, status: 'PAID' },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),

    // 3. Statistik Kartu Atas (UBAH KE NET AMOUNT & HANYA YANG PAID)
    prisma.transaction.aggregate({
      where: { businessId: business.id },
      _count: { id: true },
      _sum: { netAmount: true }, 
    }),

    // 4. Raw Query: Historical Volume
    prisma.$queryRaw`
      SELECT 
        to_char("createdAt", 'Mon YYYY') as month, 
        status, 
        COUNT(id) as count 
      FROM "Transaction" 
      WHERE "businessId" = ${business.id}
      GROUP BY 1, 2 
      ORDER BY MIN("createdAt") ASC
    `,

    // 5. Raw Query: Peak Buying Hours
    prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour, 
        COUNT(id) as count 
      FROM "Transaction" 
      WHERE "businessId" = ${business.id} AND status = 'PAID'
      GROUP BY 1 
      ORDER BY 1 ASC
    `,
    
    // 6. Query Baru: Revenue by Source
    prisma.transaction.groupBy({
      by: ['source'],
      where: { businessId: business.id, status: 'PAID' },
      _count: { id: true }
    }),

    prisma.transaction.aggregate({
      where: { businessId: business.id, status: 'PAID' },
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
      WHERE "businessId" = ${business.id}
        AND status = 'PENDING'
        AND "createdAt" < NOW() - INTERVAL '24 hours'
    `,

    prisma.transaction.groupBy({
      by: ['source', 'status'],
      where: { businessId: business.id },
      _count: { id: true },
    }),
  ]);

  const donutData = statusDistribution.map(item => ({
    name: item.status,
    value: item._count.id
  }));

  const sourceData = sourceDistribution.map(item => ({
    name: item.source === "API" ? "API Integration" : "Payment Links",
    value: Number(item._count.id)
  }));

  const formattedTopCustomers = topCustomers.map(c => ({
    ...c,
    displayName: c.customerEmail || (c.buyerWallet ? `${c.buyerWallet.slice(0, 6)}...${c.buyerWallet.slice(-4)}` : "Anonymous Wallet"),
  }));

  const paidCount = donutData.find(d => d.name === "PAID")?.value || 0;
  const pendingCount = donutData.find(d => d.name === "PENDING")?.value || 0;
  const failedCount = donutData.find(d => d.name === "FAILED")?.value || 0;
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
  const topCustomerGross = topCustomers.reduce((sum, customer) => sum + (customer._sum.amount || 0), 0);
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
  (historicalRaw as HistoricalRow[]).forEach(row => {
    const month = row.month;
    if (!historyMap.has(month)) historyMap.set(month, { month, PAID: 0, PENDING: 0, FAILED: 0 });
    const status = row.status as TransactionStatus;
    const historyPoint = historyMap.get(month);
    if (historyPoint && status in historyPoint) {
      historyPoint[status] = Number(row.count);
    }
  });
  const historicalData = Array.from(historyMap.values());

  const peakHoursData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i.toString().padStart(2, '0'),
    count: 0
  }));
  (peakHoursRaw as PeakHourRow[]).forEach(row => {
    const hourIdx = Number(row.hour);
    peakHoursData[hourIdx].count = Number(row.count);
  });
  const peakHour = peakHoursData.reduce((top, item) => (item.count > top.count ? item : top), peakHoursData[0]);
  const strongestSource = Object.entries(sourceSummary).sort((a, b) => b[1].paid - a[1].paid)[0];
  const insightSummary = [
    paidCount > 0
      ? `Net settlement is ${netVolume.toFixed(4)} SOL from ${paidCount} paid transactions.`
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
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <BarChart3 className="h-4 w-4" />
            Analytics center
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Payment intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Understand revenue quality, customer concentration, source mix, and payment behavior.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/payments" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            View ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/payment-links" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Create payment link
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Row 1: Metrik Rata-rata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KARTU 1 DIUBAH MENJADI TOTAL NET REVENUE */}
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <TrendingUp className="text-emerald-600 dark:text-emerald-400 mb-3" size={22} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Total Net Revenue</p>
          <h3 className="mt-2 text-2xl font-semibold dark:text-white font-mono text-slate-950">
            {(totalStats._sum.netAmount || 0).toFixed(4)} SOL
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">After 0.3% platform fee</p>
        </div>
        
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <Target className="text-blue-600 dark:text-blue-400 mb-3" size={22} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Total Orders</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white font-mono">{totalStats._count.id}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{paidCount} paid transactions</p>
        </div>
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <Activity className="text-amber-600 dark:text-amber-400 mb-3" size={22} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Success / Pending</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white font-mono">
            {successRate.toFixed(1)}% / {abandonedRate.toFixed(1)}%
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Paid ratio vs pending checkout</p>
        </div>
      </div>

      {/* High impact analytics blocks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                <ReceiptText className="h-4 w-4" />
                Settlement intelligence
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Finance-ready settlement math</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gross, fee, net, and average order value from paid transactions.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">SOL</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Gross volume", value: `${grossVolume.toFixed(4)} SOL` },
              { label: "Platform fee", value: `${feeVolume.toFixed(4)} SOL` },
              { label: "Net settlement", value: `${netVolume.toFixed(4)} SOL` },
              { label: "Avg order value", value: `${avgOrderValue.toFixed(4)} SOL` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 font-mono text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                <Target className="h-4 w-4" />
                Conversion funnel
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 dark:text-white text-base">Checkout completion quality</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track where payment intent turns into confirmed settlement.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {successRate.toFixed(1)}% paid
            </span>
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step) => {
              const width = totalStats._count.id > 0 ? Math.max((step.value / totalStats._count.id) * 100, step.value > 0 ? 6 : 0) : 0;
              const colorClass = step.tone === "emerald" ? "bg-emerald-500" : step.tone === "amber" ? "bg-amber-500" : step.tone === "red" ? "bg-red-500" : "bg-blue-500";

              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
                    <span className="font-mono text-slate-950 dark:text-white">{step.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(sourceSummary).map(([source, values]) => (
              <div key={source} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{source}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {values.total > 0 ? ((values.paid / values.total) * 100).toFixed(1) : "0.0"}% conversion
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
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
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
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
              <div key={insight} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Distribusi Status & Revenue Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <h3 className="font-semibold text-slate-950 dark:text-white text-base">Transaction success ratio</h3>
          <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">Distribution of paid, pending, and failed records.</p>
          <StatusDonutChart data={donutData} />
        </div>
        <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <h3 className="font-semibold text-slate-950 dark:text-white text-base">Orders by source</h3>
          <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">Compare API checkout sessions against manual payment links.</p>
          <RevenueSourceChart data={sourceData} />
        </div>
      </div>

      {/* Row 3: Historical Volume (Full Width) */}
      <div className="bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Historical volume and drop-off</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly comparison by transaction status.</p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">Monthly status comparison</span>
        </div>
        <HistoricalVolumeChart data={historicalData} />
      </div>

      {/* Row 4: Peak Hours & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white text-base">Peak buying hours</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid checkout concentration by hour.</p>
            </div>
            <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <PeakHoursChart data={peakHoursData} />
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-[#0B0F17] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Top spending customers</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Highest gross SOL volume by email or wallet.</p>
          </div>
          <TopCustomersTable customers={formattedTopCustomers} />
        </div>
      </div>
    </div>
  );
}
