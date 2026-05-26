export default function HeroPaymentIllustration() {
  return (
    <div className="landing-panel rounded-2xl p-5 sm:p-6 md:p-8" role="img" aria-label="Payment flow from create link to settlement">
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
          Solana Mainnet
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          Non-custodial
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
          0.3% fee
        </span>
      </div>

      <svg viewBox="0 0 820 520" className="w-full h-auto" aria-hidden>
        <defs>
          <linearGradient id="cardA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="cardB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="100%" stopColor="#cffafe" />
          </linearGradient>
          <linearGradient id="cardC" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        <rect x="14" y="14" width="792" height="492" rx="28" fill="rgba(15,23,42,0.04)" className="dark:fill-white/[0.04]" />

        <circle cx="168" cy="78" r="64" fill="#38bdf8" fillOpacity="0.25" filter="url(#blurGlow)" />
        <circle cx="674" cy="442" r="78" fill="#60a5fa" fillOpacity="0.2" filter="url(#blurGlow)" />

        <rect x="48" y="150" width="220" height="222" rx="18" fill="url(#cardA)" />
        <rect x="300" y="95" width="220" height="222" rx="18" fill="url(#cardB)" />
        <rect x="552" y="150" width="220" height="222" rx="18" fill="url(#cardC)" />

        <text x="68" y="185" fontSize="13" fill="#1d4ed8" fontWeight="700">STEP 1</text>
        <text x="68" y="214" fontSize="24" fill="#0f172a" fontWeight="700">Create Link</text>
        <rect x="68" y="236" width="180" height="10" rx="5" fill="#93c5fd" />
        <rect x="68" y="255" width="145" height="10" rx="5" fill="#bfdbfe" />
        <rect x="68" y="292" width="128" height="34" rx="10" fill="#2563eb" />
        <text x="84" y="314" fontSize="14" fill="#ffffff" fontWeight="600">Generate URL</text>

        <text x="320" y="130" fontSize="13" fill="#0e7490" fontWeight="700">STEP 2</text>
        <text x="320" y="159" fontSize="24" fill="#0f172a" fontWeight="700">Customer Pays</text>
        <rect x="320" y="182" width="180" height="10" rx="5" fill="#67e8f9" />
        <rect x="320" y="201" width="142" height="10" rx="5" fill="#a5f3fc" />
        <circle cx="412" cy="261" r="34" fill="#0891b2" />
        <text x="391" y="267" fontSize="20" fill="#ffffff" fontWeight="700">SOL</text>

        <text x="572" y="185" fontSize="13" fill="#047857" fontWeight="700">STEP 3</text>
        <text x="572" y="214" fontSize="24" fill="#0f172a" fontWeight="700">Merchant Settles</text>
        <rect x="572" y="236" width="180" height="10" rx="5" fill="#6ee7b7" />
        <rect x="572" y="255" width="150" height="10" rx="5" fill="#a7f3d0" />
        <rect x="572" y="288" width="168" height="58" rx="12" fill="#059669" />
        <text x="596" y="313" fontSize="15" fill="#ffffff" fontWeight="700">+9.97 SOL</text>
        <text x="596" y="332" fontSize="12" fill="#dcfce7">Wallet Received</text>

        <path d="M268 261 H298" stroke="url(#flow)" strokeWidth="8" strokeLinecap="round" />
        <path d="M520 261 H550" stroke="url(#flow)" strokeWidth="8" strokeLinecap="round" />
        <path d="M292 251 l18 10 -18 10" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M544 251 l18 10 -18 10" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
        <div className="rounded-lg px-3 py-2 bg-white/80 border landing-border dark:bg-white/[0.04]">
          <p className="landing-subtle uppercase tracking-[0.16em]">Custody</p>
          <p className="landing-heading font-semibold">You keep funds</p>
        </div>
        <div className="rounded-lg px-3 py-2 bg-white/80 border landing-border dark:bg-white/[0.04]">
          <p className="landing-subtle uppercase tracking-[0.16em]">Fee</p>
          <p className="landing-heading font-semibold">Transparent 0.3%</p>
        </div>
        <div className="rounded-lg px-3 py-2 bg-white/80 border landing-border dark:bg-white/[0.04]">
          <p className="landing-subtle uppercase tracking-[0.16em]">Settlement</p>
          <p className="landing-heading font-semibold">Under 2 seconds</p>
        </div>
      </div>
    </div>
  );
}
