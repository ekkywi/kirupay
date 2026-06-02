import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InternalRegisterContent } from "./InternalRegisterContent";

function InternalRegisterFallback() {
  return (
    <div className="landing-root min-h-screen relative overflow-hidden selection:bg-red-500/20">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-slate-50 to-slate-100 dark:from-red-950/20 dark:via-[#030712] dark:to-[#030712]" />
      <div className="landing-grid absolute inset-0 opacity-35 dark:opacity-20" />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">
        <div className="landing-panel flex w-full max-w-md items-center gap-3 rounded-2xl p-6 text-sm landing-body sm:p-8">
          <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
          Loading internal registration...
        </div>
      </main>
    </div>
  );
}

export default function InternalRegisterPage() {
  return (
    <Suspense fallback={<InternalRegisterFallback />}>
      <InternalRegisterContent />
    </Suspense>
  );
}
