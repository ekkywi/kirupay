import type { Metadata } from "next";
// src/app/(main)/admin/transactions/page.tsx
import prisma from "@/lib/neon";
import type { Prisma } from "@prisma/client";
import { formatCurrencyBreakdown } from "@/lib/currency-breakdown";
import { formatCurrencyDisplay } from "@/lib/currency-format";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Globe,
  Landmark,
  ReceiptText,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { DashboardSelect } from "@/components/dashboard/DashboardSelect";
import { buildPaymentCurrencyOptions } from "@/lib/payment-currencies";

export const metadata: Metadata = {
  title: "Admin Transactions",
};

const ITEMS_PER_PAGE = 20;
const STATUSES = ["ALL", "PAID", "PENDING", "FAILED"] as const;
const SOURCES = ["ALL", "CHECKOUT_API", "PAYMENT_LINK"] as const;

type AdminTransactionSearchParams = {
  search?: string;
  currency?: string;
  status?: string;
  source?: string;
  page?: string;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

function buildPageHref(page: number, search: string, currency: string, status: string, source: string) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", page.toString());
  if (search) params.set("search", search);
  if (currency !== "ALL") params.set("currency", currency);
  if (status !== "ALL") params.set("status", status);
  if (source !== "ALL") params.set("source", source);

  const query = params.toString();
  return query ? `/admin/transactions?${query}` : "/admin/transactions";
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<AdminTransactionSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(Number(resolvedSearchParams.page) || 1, 1);
  const search = resolvedSearchParams.search?.trim() || "";
  const selectedRawCurrency = typeof resolvedSearchParams.currency === "string" ? resolvedSearchParams.currency.toUpperCase() : "ALL";
  const status = STATUSES.includes(resolvedSearchParams.status as (typeof STATUSES)[number]) ? resolvedSearchParams.status || "ALL" : "ALL";
  const source = SOURCES.includes(resolvedSearchParams.source as (typeof SOURCES)[number]) ? resolvedSearchParams.source || "ALL" : "ALL";

  const discoveredCurrencies = await prisma.transaction.findMany({
    distinct: ["currency"],
    select: { currency: true },
    orderBy: { currency: "asc" },
  });
  const currencyOptions = buildPaymentCurrencyOptions(discoveredCurrencies.map((row) => row.currency));
  const selectedCurrency = currencyOptions.includes(selectedRawCurrency) ? selectedRawCurrency : "ALL";

  const whereClause: Prisma.TransactionWhereInput = {};
  const currencyScope: Prisma.TransactionWhereInput = selectedCurrency !== "ALL" ? { currency: selectedCurrency } : {};

  if (search) {
    whereClause.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { orderId: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerReference: { contains: search, mode: "insensitive" } },
      { buyerWallet: { contains: search, mode: "insensitive" } },
      { txSignature: { contains: search, mode: "insensitive" } },
      {
        business: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contactEmail: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  if (status !== "ALL") {
    whereClause.status = status;
  }

  if (source !== "ALL") {
    whereClause.source = source;
  }

  if (selectedCurrency !== "ALL") {
    whereClause.currency = selectedCurrency;
  }

  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const paidWhere: Prisma.TransactionWhereInput = { ...currencyScope, status: "PAID" };

  const [transactions, totalCount, filteredStats, paidStats, pendingCount, failedCount] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        business: { select: { name: true, contactEmail: true } },
      },
    }),
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: whereClause,
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: paidWhere,
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
      orderBy: { currency: "asc" },
    }),
    prisma.transaction.count({ where: { ...currencyScope, status: "PENDING" } }),
    prisma.transaction.count({ where: { ...currencyScope, status: "FAILED" } }),
  ]);

  const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);
  const filteredCount = totalCount;
  const paidCount = paidStats.reduce((sum, row) => sum + row._count.id, 0);
  const filteredGrossBreakdown = formatCurrencyBreakdown(filteredStats, "amount");
  const paidVolumeBreakdown = formatCurrencyBreakdown(paidStats, "amount");
  const paidFeesBreakdown = formatCurrencyBreakdown(paidStats, "feeAmount");

  return (
        <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <Globe className="h-4 w-4" />
            Global ledger
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Network transaction audit
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and inspect every checkout and payment-link transaction across all businesses.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/overview" className="dashboard-secondary">
            Overview
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
            icon: ReceiptText,
            label: "Filtered records",
            value: filteredCount.toString(),
            detail: filteredGrossBreakdown === "-" ? "No gross volume yet" : `Gross in view: ${filteredGrossBreakdown}`,
            tone: "blue",
          },
          {
            icon: CheckCircle2,
            label: "Paid network volume",
            value: paidVolumeBreakdown,
            detail: `${paidCount} confirmed payments`,
            tone: "emerald",
          },
          {
            icon: Landmark,
            label: "Platform fees",
            value: paidFeesBreakdown,
            detail: paidFeesBreakdown === "-" ? "No platform fees yet" : "Fees in current filter scope",
            tone: "emerald",
          },
          {
            icon: Clock3,
            label: "Open risk states",
            value: `${pendingCount} / ${failedCount}`,
            detail: selectedCurrency === "ALL" ? "pending / failed transactions" : `${selectedCurrency} pending / failed transactions`,
            tone: failedCount > 0 ? "amber" : "blue",
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

      <AdminSurface padded={false} className="p-4">
        <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_170px_180px_190px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search order, reference, business, email, wallet, tx signature..."
              className="w-full dashboard-muted-panel py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
            />
          </div>

          <DashboardSelect
            name="currency"
            defaultValue={selectedCurrency}
            variant="muted"
            options={[
              { value: "ALL", label: "All currencies" },
              ...currencyOptions.map((currency) => ({ value: currency, label: currency })),
            ]}
            className="w-full px-3 py-3"
          />

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <DashboardSelect
              name="status"
              defaultValue={status}
              variant="muted"
              withLeftIcon
              options={[
                { value: "ALL", label: "All status" },
                { value: "PAID", label: "Paid" },
                { value: "PENDING", label: "Pending" },
                { value: "FAILED", label: "Failed" },
              ]}
              className="w-full py-3"
            />
          </div>

          <DashboardSelect
            name="source"
            defaultValue={source}
            variant="muted"
            options={[
              { value: "ALL", label: "All sources" },
              { value: "CHECKOUT_API", label: "Checkout API" },
              { value: "PAYMENT_LINK", label: "Payment link" },
            ]}
            className="w-full px-3 py-3"
          />

          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:via-violet-700 hover:to-cyan-700">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </AdminSurface>

      <AdminSurface padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionHeader
            eyebrow="Audit table"
            title="Transactions"
            description={`Showing page ${currentPage} of ${totalPages}, ${totalCount} matching records.`}
          />
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin audit mode
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No transactions found</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try adjusting the search, source, or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="dashboard-table-head">
                <tr>
                  <th className="px-5 py-4">Business</th>
                  <th className="px-5 py-4">Order / Source</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Gross</th>
                  <th className="px-5 py-4">Fee</th>
                  <th className="px-5 py-4">Net</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950 dark:text-white">{transaction.business.name || "Unnamed business"}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{transaction.business.contactEmail || "No contact email"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{transaction.orderId}</p>
                      <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                        {transaction.source.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[180px] truncate text-xs text-slate-600 dark:text-slate-300">{transaction.customerEmail || "No email"}</p>
                      <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {transaction.customerReference || "No customer ref"}
                      </p>
                      <p className="mt-0.5 max-w-[180px] truncate font-mono text-[10px] text-slate-400">{transaction.buyerWallet || "No wallet captured"}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {formatCurrencyDisplay(transaction.currency, transaction.amount)}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {transaction.feeAmount != null ? `+${formatCurrencyDisplay(transaction.currency, transaction.feeAmount)}` : "-"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrencyDisplay(transaction.currency, transaction.netAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(transaction.status)}`}>
                        {transaction.status === "FAILED" ? <XCircle className="h-3.5 w-3.5" /> : transaction.status === "PAID" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatDate(transaction.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={transaction.txSignature ? `https://explorer.solana.com/tx/${transaction.txSignature}?cluster=devnet` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex rounded-lg p-2 transition-colors ${
                          transaction.txSignature
                            ? "text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-cyan-300"
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

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 dashboard-card p-4 shadow-sm shadow-blue-950/5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-950 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-950 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Link
              href={buildPageHref(currentPage - 1, search, selectedCurrency, status, source)}
              aria-disabled={currentPage <= 1}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition-colors dark:border-white/10 ${
                currentPage <= 1
                  ? "pointer-events-none text-slate-300 dark:text-slate-700"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
            <Link
              href={buildPageHref(currentPage + 1, search, selectedCurrency, status, source)}
              aria-disabled={currentPage >= totalPages}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition-colors dark:border-white/10 ${
                currentPage >= totalPages
                  ? "pointer-events-none text-slate-300 dark:text-slate-700"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
