import type { Metadata } from "next";
import prisma from "@/lib/neon";
import type { Prisma } from "@prisma/client";
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { SuspendButton } from "@/components/admin/SuspendButton";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Merchants",
};

type AdminMerchantSearchParams = {
  search?: string;
};

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<AdminMerchantSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search?.trim() || "";
  const whereClause: Prisma.MerchantWhereInput = {};

  if (search) {
    whereClause.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const merchants = await prisma.merchant.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  const activeCount = merchants.filter((merchant) => merchant.isActive).length;
  const suspendedCount = merchants.length - activeCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldCheck className="h-4 w-4" />
            Merchant governance
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Merchant directory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review merchant accounts, inspect profile activity, and manage account suspension state.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/overview" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Admin overview
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/transactions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
            Global ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminMetricCard icon={Users} label="Total merchants" value={merchants.length.toString()} detail="Filtered directory records" tone="blue" />
        <AdminMetricCard icon={CheckCircle2} label="Active accounts" value={activeCount.toString()} detail="Can access payment operations" tone="emerald" />
        <AdminMetricCard icon={XCircle} label="Suspended accounts" value={suspendedCount.toString()} detail="Temporarily blocked merchants" tone="red" />
      </div>

      <AdminSurface padded={false} className="p-4">
        <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by business name or merchant email..."
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
          <AdminSectionHeader eyebrow="Merchant table" title="Directory records" description={`Showing ${merchants.length} merchants in current query.`} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Merchant</th>
                <th className="px-5 py-4">Registered</th>
                <th className="px-5 py-4">Transactions</th>
                <th className="px-5 py-4">Account status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No merchants found</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try changing your search query.</p>
                  </td>
                </tr>
              )}
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
                        {merchant.businessName ? merchant.businessName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950 dark:text-white">{merchant.businessName || "Unfinished setup"}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{merchant.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Intl.DateTimeFormat("en", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(merchant.createdAt)}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                    {merchant._count.transactions} TX
                  </td>

                  <td className="px-5 py-4">
                    {merchant.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                        <XCircle className="h-3.5 w-3.5" />
                        Suspended
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/merchants/${merchant.id}`}
                        className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        title="View merchant profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <SuspendButton merchantId={merchant.id} isActive={merchant.isActive} />
                    </div>
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