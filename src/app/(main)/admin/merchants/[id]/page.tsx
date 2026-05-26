import type { Metadata } from "next";
import prisma from "@/lib/neon";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wallet,
  ArrowUpRight
} from "lucide-react";

const formatSOL = (val: number | null | undefined) => val ? val.toFixed(4) : "0.0000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id: resolvedParams.id },
    select: { businessName: true },
  });

  if (!merchant) {
    return { title: "Admin Merchant" };
  }

  return {
    title: `Admin Merchant ${merchant.businessName || ""}`.trim(),
  };
}

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const merchantId = resolvedParams.id;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          business: {
            include: {
              settlementWallets: {
                where: { isActive: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!merchant) {
    notFound();
  }

  const businessIds = merchant.memberships.map((membership) => membership.businessId);

  const [stats, recentTransactions, totalTx] = await Promise.all([
    prisma.transaction.aggregate({
      where: { businessId: { in: businessIds }, status: "PAID" },
      _sum: { amount: true, feeAmount: true }
    }),
    prisma.transaction.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.transaction.count({
      where: { businessId: { in: businessIds } }
    })
  ]);

  const totalVolume = stats._sum.amount || 0;
  const totalFeesPaid = stats._sum.feeAmount || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link href="/admin/merchants" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldCheck className="h-4 w-4" />
            Merchant profile
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {merchant.businessName || "Unnamed merchant"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Account lifecycle, settlement wallet, and latest transaction activity for this merchant.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
          {merchant.isActive ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Active account
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              Suspended account
            </>
          )}
        </div>
      </AdminSurface>

      <AdminSurface>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Merchant email</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <Mail className="h-4 w-4 text-slate-400" />
              {merchant.email}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Joined</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(merchant.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Active businesses</p>
            <p className="mt-2 flex items-center gap-2 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
              <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
              {merchant.memberships.length}
            </p>
          </div>
        </div>
      </AdminSurface>

      <AdminSurface>
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Business memberships</p>
          {merchant.memberships.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No active business memberships.</p>
          ) : (
            merchant.memberships.map((membership) => (
              <div key={membership.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{membership.business.name}</p>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{membership.business.contactEmail || membership.business.code}</p>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Settlement: {membership.business.settlementWallets[0]?.walletAddress || "Not configured yet"}
                </p>
              </div>
            ))
          )}
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminMetricCard icon={Activity} label="Total processed" value={`${formatSOL(totalVolume)} SOL`} detail="Paid transaction gross volume" tone="blue" />
        <AdminMetricCard icon={TrendingUp} label="Fee contribution" value={`${formatSOL(totalFeesPaid)} SOL`} detail="Platform revenue from this merchant" tone="emerald" />
        <AdminMetricCard icon={Clock3} label="Total transactions" value={totalTx.toString()} detail="All statuses combined" tone="slate" />
      </div>

      <AdminSurface padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionHeader eyebrow="Merchant ledger" title="Recent transactions" description="Latest 10 transaction records tied to this merchant." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Order ref</th>
                <th className="px-5 py-4">Gross</th>
                <th className="px-5 py-4">Fee</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No transactions recorded for this merchant yet.
                  </td>
                </tr>
              )}
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.orderId}</td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">{formatSOL(tx.amount)} SOL</td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{formatSOL(tx.feeAmount)} SOL</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      tx.status === "PAID" 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" 
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Intl.DateTimeFormat("en", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(tx.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={tx.txSignature ? `https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex rounded-lg p-2 transition-colors ${
                        tx.txSignature ? "text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-300" : "cursor-not-allowed text-slate-300 dark:text-slate-700"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSurface>
    </div>
  );
}
