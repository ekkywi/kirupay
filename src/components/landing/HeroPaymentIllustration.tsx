export default function HeroPaymentIllustration() {
  return (
    <div className="landing-hero-visual relative overflow-hidden rounded-[2.2rem] p-4 sm:p-5" role="img" aria-label="Trezalink payment infrastructure preview">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-300/35 blur-3xl dark:bg-blue-400/20" />
      <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/15" />

      <div className="relative rounded-[1.7rem] border border-white/70 bg-white/76 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Payment link</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Invoice checkout</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-700 dark:bg-blue-400/10 dark:text-cyan-300">
            Solana live
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.76fr]">
          <div className="rounded-[1.4rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Customer payment</span>
              <span>TL-2049</span>
            </div>
            <div className="mt-8">
              <p className="text-sm text-slate-400">Amount due</p>
              <p className="mt-2 text-5xl font-black tracking-[-0.06em]">10.00</p>
              <p className="mt-1 text-sm font-bold text-emerald-300">SOL mainnet</p>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Trezalink fee</span>
                <span className="font-black">0.03 SOL</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Merchant receives</span>
                <span className="font-black text-emerald-200">9.97 SOL</span>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-4 py-3 text-center text-sm font-black text-slate-950">
              Pay with wallet
            </div>
          </div>

          <div className="space-y-3">
            {[
              ["Link created", "Checkout URL ready"],
              ["Wallet signed", "Customer approved"],
              ["Webhook sent", "Backend fulfilled"],
            ].map(([title, copy], idx) => (
              <div key={title} className="rounded-[1.2rem] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-xs font-black text-blue-700 dark:bg-blue-400/10 dark:text-cyan-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{copy}</p>
                  </div>
                </div>
              </div>
            ))}

            <svg viewBox="0 0 260 150" className="h-auto w-full" aria-hidden>
              <defs>
                <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="252" height="142" rx="24" fill="currentColor" className="text-white/70 dark:text-white/[0.04]" />
              <path d="M34 106 C74 62 97 92 128 66 C157 41 181 55 226 32" fill="none" stroke="url(#line)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="34" cy="106" r="7" fill="#2563eb" />
              <circle cx="128" cy="66" r="7" fill="#14b8a6" />
              <circle cx="226" cy="32" r="7" fill="#22d3ee" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
