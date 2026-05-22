import type { Metadata } from "next";
import { AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { getPlatformMaintenanceState } from "@/lib/platform-maintenance";
import { Signal, Wrench } from "lucide-react";
import { saveMaintenanceSettingsAction } from "../actions";
import { MaintenanceFlash, MaintenanceHeader } from "../_shared";

export const metadata: Metadata = {
  title: "Admin Maintenance Control",
};

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function toDateTimeLocalValue(value: Date | null | undefined) {
  if (!value) return "";
  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default async function AdminMaintenanceControlPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const maintenance = await getPlatformMaintenanceState();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MaintenanceFlash errorMessage={resolvedSearchParams.error} successMessage={resolvedSearchParams.success} />
      <MaintenanceHeader description="Manage the global maintenance switch and public maintenance messaging." />

      <AdminSurface padded={false} className="h-fit">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader
            eyebrow="Maintenance mode"
            title="Global switch and message"
            description="This toggle blocks the public payment flow while keeping the admin panel available."
          />
        </div>

        <form action={saveMaintenanceSettingsAction} className="space-y-6 p-5 lg:p-6">
          <input type="hidden" name="returnTo" value="/admin/maintenance/control" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex min-h-[132px] cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <input
                type="checkbox"
                name="enabled"
                value="on"
                defaultChecked={maintenance.enabled}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950 dark:text-white">Enable maintenance</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Public checkout and API creation requests will return maintenance responses.
                </span>
              </span>
            </label>

            <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current schedule</p>
              <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                {maintenance.maintenanceEndsAt ? formatDateTime(maintenance.maintenanceEndsAt) : "Not scheduled"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Last updated {formatDateTime(maintenance.updatedAt)}
                {maintenance.updatedByEmail ? ` by ${maintenance.updatedByEmail}` : ""}.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Maintenance message</span>
              <textarea
                name="message"
                defaultValue={maintenance.message}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                placeholder="Describe the issue or estimated return time..."
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Estimated return</span>
              <input
                type="datetime-local"
                name="maintenanceEndsAt"
                defaultValue={toDateTimeLocalValue(maintenance.maintenanceEndsAt)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-red-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Leave empty if you do not want to show an estimate.</p>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Wrench className="h-4 w-4" />
              Save maintenance settings
            </button>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
              <Signal className="h-4 w-4" />
              Admin-only state control
            </div>
          </div>
        </form>
      </AdminSurface>
    </div>
  );
}