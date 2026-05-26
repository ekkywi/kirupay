import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/StatCard";
import { SettlementWalletStatusCard } from "@/components/dashboard/SettlementWalletStatusCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";
import { Activity, CreditCard, CheckCircle2, LayoutDashboard, ArrowUpRight, ShieldCheck } from "lucide-react";
import SetupGatekeeper from "@/components/dashboard/SetupGatekeeper";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
    thisMonthRevAgg,
    lastMonthRevAgg,
    totalTxCount,
    paidTxCount,
    last7DaysTx 
  ] = await Promise.all([
    prisma.transaction.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.transaction.aggregate({ where: { businessId: business.id, status: "PAID", createdAt: { gte: startOfThisMonth } }, _sum: { netAmount: true, amount: true } }),
    prisma.transaction.aggregate({ where: { businessId: business.id, status: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { netAmount: true, amount: true } }),
    prisma.transaction.count({ where: { businessId: business.id } }),
    prisma.transaction.count({ where: { businessId: business.id, status: "PAID" } }),
    prisma.transaction.findMany({ 
      where: { businessId: business.id, status: "PAID", createdAt: { gte: sevenDaysAgo } },
      select: { netAmount: true, amount: true, createdAt: true }
    }),
  ]);

  const thisMonthRev = thisMonthRevAgg._sum.netAmount ?? thisMonthRevAgg._sum.amount ?? 0;
  const lastMonthRev = lastMonthRevAgg._sum.netAmount ?? lastMonthRevAgg._sum.amount ?? 0;
  
  let revenueTrend = 0;
  if (lastMonthRev > 0) revenueTrend = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
  else if (thisMonthRev > 0) revenueTrend = 100;
  const successRate = totalTxCount > 0 ? (paidTxCount / totalTxCount) * 100 : 0;

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: 0,
      fullDateString: d.toDateString()
    };
  });

  last7DaysTx.forEach(tx => {
    const txDateStr = new Date(tx.createdAt).toDateString();
    const dayIndex = chartData.findIndex(d => d.fullDateString === txDateStr);
    if (dayIndex !== -1) {
      chartData[dayIndex].amount += (tx.netAmount ?? tx.amount ?? 0);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <LayoutDashboard className="h-4 w-4" />
            Business overview
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Welcome back, {userLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor business settlement, payment conversion, and recent operational activity.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Managing: {business.name} · Active business
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/payment-links" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Payment Links
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/business" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Business Hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Net Revenue (This Month)" value={`${thisMonthRev.toFixed(4)} (mixed assets)`} icon={<Activity size={18} />} trend={`${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}%`} trendUp={revenueTrend >= 0} description="Compared with last month" />
        <StatCard label="Total Transactions" value={totalTxCount.toString()} icon={<CreditCard size={18} />} trend="All-time" trendUp={true} description="Total payment attempts" />
        <StatCard label="Success Rate" value={`${successRate.toFixed(1)}%`} icon={<CheckCircle2 size={18} />} trend="Paid vs failed" trendUp={successRate >= 50} description="Payment conversion rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm shadow-slate-200/60 dark:shadow-none">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white text-base">Revenue trajectory</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Net paid volume across the last 7 days.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Mixed assets</span>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SettlementWalletStatusCard walletAddress={business.settlementWallet?.walletAddress || null} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-slate-950 dark:text-white">Operational controls</h3>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Settlement model", value: "Non-custodial" },
                { label: "Checkout assets", value: "SOL / USDC" },
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

      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm shadow-slate-200/60 dark:shadow-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white text-base">Recent transactions</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest payment attempts and settlements.</p>
          </div>
          <Link href="/payments" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400">
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <TransactionTable transactions={recentTransactions} totalPages={1} showControls={false} />
      </div>

    </div>
  );
}
