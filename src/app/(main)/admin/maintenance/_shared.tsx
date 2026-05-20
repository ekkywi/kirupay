import { AdminSurface } from "@/components/admin/AdminUI";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function MaintenanceFlash({ errorMessage, successMessage }: { errorMessage?: string; successMessage?: string }) {
  return (
    <>
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </div>
      )}
    </>
  );
}

export function MaintenanceHeader({ description }: { description: string }) {
  return (
    <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
          <ShieldAlert className="h-4 w-4" />
          Platform operations
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Maintenance control center
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/admin/overview"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
        >
          Admin overview
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href="/status"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Public status
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </AdminSurface>
  );
}
