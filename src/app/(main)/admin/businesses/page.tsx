import type { Metadata } from "next";
import prisma from "@/lib/neon";
import type { Prisma } from "@prisma/client";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  Wallet,
  Webhook,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";

export const metadata: Metadata = {
  title: "Admin Businesses",
};

type AdminBusinessSearchParams = {
  search?: string;
};

const formatSOL = (value: number | null | undefined, precision = 4) => (value ?? 0).toFixed(precision);

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<AdminBusinessSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search?.trim() || "";
  const whereClause: Prisma.BusinessEntityWhereInput = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const businesses = await prisma.businessEntity.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      credentials: { select: { webhookUrl: true } },
      _count: { select: { memberships: true, settlementWallets: true, transactions: true } },
    },
  });

  const businessIds = businesses.map((business) => business.id);
  const transactionStats =
    businessIds.length === 0
      ? []
      : await prisma.transaction.groupBy({
          by: ["businessId"],
          where: { businessId: { in: businessIds } },
          _count: { id: true },
          _sum: { amount: true, feeAmount: true },
        });

  const statsByBusinessId = new Map(
    transactionStats.map((stat) => [
      stat.businessId,
      {
        txCount: stat._count.id,
        paidVolume: stat._sum.amount || 0,
        feeContribution: stat._sum.feeAmount || 0,
      },
    ])
  );

  const activeCount = businesses.filter((business) => business.isActive).length;
  const inactiveCount = businesses.length - activeCount;
  const webhookReadyCount = businesses.filter((business) => Boolean(business.credentials?.webhookUrl)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldCheck className="h-4 w-4" />
            Business operations
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Business directory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track business entities that own transaction ledger activity, settlement, and webhook readiness.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/overview" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Admin overview
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/merchants" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Merchant accounts
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminMetricCard icon={Building2} label="Total businesses" value={businesses.length.toString()} detail="Filtered directory records" tone="blue" />
        <AdminMetricCard icon={CheckCircle2} label="Active businesses" value={activeCount.toString()} detail="Can process operations" tone="emerald" />
        <AdminMetricCard icon={XCircle} label="Inactive businesses" value={inactiveCount.toString()} detail="Operations currently paused" tone="red" />
        <AdminMetricCard icon={Webhook} label="Webhook ready" value={webhookReadyCount.toString()} detail="Webhook URL configured" tone="blue" />
      </div>

      <AdminSurface padded={false} className="p-4">
        <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by business name, code, or contact email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
            />
          </div>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </AdminSurface>

      <AdminSurface padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionHeader eyebrow="Business table" title="Directory records" description={`Showing ${businesses.length} businesses in current query.`} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Business</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Transactions</th>
                <th className="px-5 py-4">Paid volume</th>
                <th className="px-5 py-4">Fee contribution</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No businesses found</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try changing your search query.</p>
                  </td>
                </tr>
              )}
              {businesses.map((business) => {
                const stats = statsByBusinessId.get(business.id);
                return (
                  <tr key={business.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
                          {business.name ? business.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950 dark:text-white">{business.name || "Unnamed business"}</p>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{business.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-xs text-slate-600 dark:text-slate-300">{business.contactEmail || "No contact email"}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{business._count.memberships} memberships</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <Wallet className="h-3.5 w-3.5" />
                        {business._count.settlementWallets} wallets linked
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {business.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {stats?.txCount ?? business._count.transactions} TX
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {formatSOL(stats?.paidVolume)} SOL
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatSOL(stats?.feeContribution)} SOL
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Intl.DateTimeFormat("en", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(business.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminSurface>
    </div>
  );
}
