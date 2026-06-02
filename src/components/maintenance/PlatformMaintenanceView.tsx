import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, ShieldAlert } from "lucide-react";

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function PlatformMaintenanceView({
  message,
  maintenanceEndsAt,
}: {
  message: string;
  maintenanceEndsAt?: Date | null;
}) {
  const formattedEndsAt = formatDateTime(maintenanceEndsAt);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/40 bg-white/90 p-8 shadow-2xl shadow-red-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#111111]/90 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/25 ring-8 ring-red-50 dark:ring-red-500/10">
          <ShieldAlert size={34} strokeWidth={2.2} />
        </div>

        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Maintenance active
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Checkout is temporarily unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {message}
          </p>

          {formattedEndsAt && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
              <Clock3 className="h-4 w-4 text-red-500" />
              Estimated return: <span className="font-semibold">{formattedEndsAt}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/status"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              System status
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              Payment flow paused safely
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}