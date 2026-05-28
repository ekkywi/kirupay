import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/StatCard";
import { SettlementWalletStatusCard } from "@/components/dashboard/SettlementWalletStatusCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, LayoutDashboard, ArrowUpRight, ShieldCheck } from "lucide-react";
import SetupGatekeeper from "@/components/dashboard/SetupGatekeeper";
import Link from "next/link";
import { formatCurrencyNumber } from "@/lib/currency-format";

export const metadata: Metadata = {
  title: "Dashboard",
};

type RevenueByCurrency = {
  currency: string;
  thisMonthNet: number;
  lastMonthNet: number;
  trendPct: number;
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

export default async function DashboardPage() {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const merchant = ctx.merchant;
  const business = ctx.business;
  const userLabel = merchant.businessName?.trim() || merchant.email.split("@")[0] || "Merchant";

  const isWalletDummyEmail = merchant.email.includes("@wallet.auth");
  const isUnverified = merchant.emailVerified === false;

  if (isWalletDummyEmail || isUnverified) {
    return <SetupGatekeeper businessId={business.id} currentEmail={merchant.email} isWalletUser={isWalletDummyEmail} />;
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    recentTransactions,
    thisMonthRevenueByCurrency,
    lastMonthRevenueByCurrency,
    totalTxCount,
    paidTxCount,
    last7DaysTx,
    businessCurrencies,
  ] = await Promise.all([
    prisma.transaction.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { businessId: business.id, status: "PAID", createdAt: { gte: startOfThisMonth } },
      _sum: { netAmount: true, amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { businessId: business.id, status: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { netAmount: true, amount: true },
    }),
    prisma.transaction.count({ where: { businessId: business.id } }),
    prisma.transaction.count({ where: { businessId: business.id, status: "PAID" } }),
    prisma.transaction.findMany({
      where: { businessId: business.id, status: "PAID", createdAt: { gte: sevenDaysAgo } },
      select: { netAmount: true, amount: true, createdAt: true, currency: true }
    }),
    prisma.transaction.findMany({
      where: { businessId: business.id },
      distinct: ["currency"],
      select: { currency: true },
      orderBy: { currency: "asc" },
    }),
  ]);

  const successRate = totalTxCount > 0 ? (paidTxCount / totalTxCount) * 100 : 0;

  const thisMonthMap = new Map<string, number>();
  const lastMonthMap = new Map<string, number>();
  for (const row of thisMonthRevenueByCurrency) {
    thisMonthMap.set(row.currency, row._sum.netAmount ?? row._sum.amount ?? 0);
  }
  for (const row of lastMonthRevenueByCurrency) {
    lastMonthMap.set(row.currency, row._sum.netAmount ?? row._sum.amount ?? 0);
  }

  const currencySet = new Set<string>([
    ...Array.from(thisMonthMap.keys()),
    ...Array.from(lastMonthMap.keys()),
    ...businessCurrencies.map((item) => item.currency),
  ]);

  const revenueByCurrency: RevenueByCurrency[] = Array.from(currencySet)
    .map((currency) => {
      const thisMonthNet = thisMonthMap.get(currency) ?? 0;
      const lastMonthNet = lastMonthMap.get(currency) ?? 0;
      let trendPct = 0;
      if (lastMonthNet > 0) trendPct = ((thisMonthNet - lastMonthNet) / lastMonthNet) * 100;
      else if (thisMonthNet > 0) trendPct = 100;

      return {
        currency,
        thisMonthNet,
        lastMonthNet,
        trendPct,
      };
    })
    .filter((item) => item.thisMonthNet > 0 || item.lastMonthNet > 0)
    .sort((a, b) => b.thisMonthNet - a.thisMonthNet || a.currency.localeCompare(b.currency));

  const chartBaseData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDateString: d.toDateString()
    };
  });

  const chartCurrencies = Array.from(new Set(last7DaysTx.map((tx) => tx.currency)))
    .sort((a, b) => a.localeCompare(b));

  const chartData: Array<{ date: string } & Record<string, number>> = chartBaseData.map((day) => {
    const row: { date: string } & Record<string, number> = { date: day.date };
    for (const currency of chartCurrencies) {
      row[currency] = 0;
    }
    return row;
  });

  const chartDateMap = chartBaseData.map((day) => day.fullDateString);
  last7DaysTx.forEach((tx) => {
    const txDateStr = new Date(tx.createdAt).toDateString();
    const dayIndex = chartDateMap.findIndex((d) => d === txDateStr);
    if (dayIndex !== -1) {
      const currency = tx.currency;
      const currentValue = chartData[dayIndex][currency] ?? 0;
      chartData[dayIndex][currency] = currentValue + (tx.netAmount ?? tx.amount ?? 0);
    }
  });

  const chartSeries = chartCurrencies.map((currency, index) => ({
    key: currency,
    label: currency,
    color: CURRENCY_SERIES_COLORS[index % CURRENCY_SERIES_COLORS.length],
  }));

  const checkoutAssetsLabel = businessCurrencies.length
    ? businessCurrencies.map((item) => item.currency).join(" / ")
    : "Multi-currency enabled";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="dashboard-header flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            <LayoutDashboard className="h-4 w-4" />
            Business overview
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Welcome back, {userLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor business settlement, payment conversion, and recent operational activity.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Managing: {business.name} · Active business
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/payment-links" className="dashboard-secondary">
            Payment Links
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/business" className="dashboard-primary">
            Business Hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="dashboard-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Net Revenue (This Month)</p>
          <div className="mt-3 space-y-2">
            {revenueByCurrency.length === 0 ? (
              <p className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-400">No paid revenue yet</p>
            ) : (
              revenueByCurrency.map((metric) => (
                <div key={metric.currency} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{metric.currency}</span>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-slate-950 dark:text-white">
                      {formatCurrencyNumber(metric.currency, metric.thisMonthNet)} {metric.currency}
                    </p>
                    <p className={`text-[11px] ${metric.trendPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {metric.trendPct >= 0 ? "+" : ""}
                      {metric.trendPct.toFixed(1)}% vs last month
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <StatCard label="Total Transactions" value={totalTxCount.toString()} icon={<CreditCard size={18} />} trend="All-time" trendUp={true} description="Total payment attempts" />
        <StatCard label="Success Rate" value={`${successRate.toFixed(1)}%`} icon={<CheckCircle2 size={18} />} trend="Paid vs failed" trendUp={successRate >= 50} description="Payment conversion rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 dashboard-card p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white text-base">Revenue trajectory</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Net paid volume across the last 7 days by currency.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Per currency</span>
          </div>
          <RevenueChart data={chartData} series={chartSeries} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SettlementWalletStatusCard walletAddress={business.settlementWallet?.walletAddress || null} />
          <div className="dashboard-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-slate-950 dark:text-white">Operational controls</h3>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Settlement model", value: "Non-custodial" },
                { label: "Checkout assets", value: checkoutAssetsLabel },
                { label: "Webhook signing", value: "HMAC ready" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                  <span className="font-medium text-slate-950 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Recent transactions</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest payment attempts and settlements.</p>
          </div>
          <Link href="/payments" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 hover:text-emerald-700 transition-colors dark:text-emerald-400">
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <TransactionTable transactions={recentTransactions} totalPages={1} showControls={false} />
      </div>

    </div>
  );
}
