/** Theme-aware static background (no animations). */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-slate-50 to-slate-50 dark:from-blue-950/25 dark:via-[#030712] dark:to-[#030712]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100%)] h-[420px] bg-blue-400/10 dark:bg-blue-600/8 rounded-full blur-3xl" />
      <div className="landing-grid absolute inset-0 opacity-40 dark:opacity-20" />
    </div>
  );
}
