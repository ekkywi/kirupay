import type { Metadata } from "next";
// src/app/dashboard/payment-links/page.tsx
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";
import { CreateLinkButton } from "@/components/dashboard/CreateLinkButton";
import { LinkTable } from "@/components/dashboard/LinkTable";
import { ArrowUpRight, CheckCircle2, Clock3, LinkIcon, ReceiptText, Send } from "lucide-react";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Links",
};

// Tentukan jumlah data per halaman
const ITEMS_PER_PAGE = 10;

export default async function PaymentLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");
  const business = ctx.business;

  const params = await searchParams;

  // 1. Ekstrak nilai parameter dari URL
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const statusFilter = typeof params.status === "string" ? params.status : "ALL";

  // 2. Rangkai kondisi filter dinamis untuk Prisma
  const whereCondition: Prisma.TransactionWhereInput = {
    businessId: business.id,
    source: "PAYMENT_LINK",
  };

  if (search) {
    whereCondition.orderId = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (statusFilter !== "ALL") {
    whereCondition.status = statusFilter;
  }

  const baseWhere: Prisma.TransactionWhereInput = {
    businessId: business.id,
    source: "PAYMENT_LINK",
  };

  // 3. Hitung total data untuk Paginasi
  const [totalItems, paidStats, pendingCount, failedCount] = await Promise.all([
    prisma.transaction.count({ where: whereCondition }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, status: "PAID" },
      _count: { id: true },
      _sum: { amount: true, feeAmount: true, netAmount: true },
    }),
    prisma.transaction.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.transaction.count({ where: { ...baseWhere, status: "FAILED" } }),
  ]);
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // 4. Ambil HANYA 10 data yang sesuai halaman saat ini (Skip & Take)
  const links = await prisma.transaction.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const grossVolume = paidStats._sum.amount || 0;
  const netVolume = paidStats._sum.netAmount || 0;
  const paidCount = paidStats._count.id;
  const conversionRate = totalItems > 0 ? (paidCount / totalItems) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="dashboard-header flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            <LinkIcon className="h-4 w-4" aria-hidden />
            No-code collections
          </div>
          <h2 id="payment-links-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Payment links
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create hosted SOL checkout links for invoices, retainers, and one-off client payments.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/payments" className="dashboard-secondary">
            View ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <CreateLinkButton businessId={business.id} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: Send, label: "Total links", value: totalItems.toString(), detail: "matching current filters", tone: "blue" },
          { icon: CheckCircle2, label: "Paid links", value: paidCount.toString(), detail: `${conversionRate.toFixed(1)}% conversion`, tone: "emerald" },
          { icon: ReceiptText, label: "Net from links", value: `${netVolume.toFixed(4)} SOL`, detail: `${grossVolume.toFixed(4)} SOL gross`, tone: "emerald" },
          { icon: Clock3, label: "Pending / failed", value: `${pendingCount} / ${failedCount}`, detail: "open payment states", tone: "amber" },
        ].map((metric) => (
          <div key={metric.label} className="dashboard-card p-5">
            <metric.icon className={`mb-4 h-5 w-5 ${metric.tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : metric.tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      {/* 5. Kirim data dan total halaman ke komponen LinkTable yang sudah kita upgrade */}
      <LinkTable links={links} totalPages={totalPages} />
    </div>
  );
}
