import { Layers, Coins } from "lucide-react";
import ScrollReveal from "@/components/landing/ScrollReveal";

const NETWORKS = [
  {
    id: "solana",
    name: "Solana",
    chainId: "Mainnet",
    status: "live" as const,
    description: "High-throughput L1 with sub-second finality and low fees.",
  },
];

const CURRENCIES = [
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    status: "live" as const,
    description: "Native asset for checkout, settlement, and platform fees.",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin (SPL)",
    status: "soon" as const,
    description: "Stablecoin payments on Solana — on our product roadmap.",
  },
];

function StatusBadge({ status }: { status: "live" | "soon" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        Live
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">
      Coming soon
    </span>
  );
}

function SolanaLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" aria-hidden>
      <defs>
        <linearGradient id="sol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14F195" />
          <stop offset="50%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#00C2FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#sol-grad)"
        d="M8.2 21.1c-.2-.2-.1-.5.1-.6l19.8-7.5c.3-.1.5.2.3.5l-3.2 4.4c-.1.2-.3.3-.5.3H8.4c-.1 0-.2-.1-.2-.1zm-.1-5.2c-.2-.2-.1-.5.1-.6l19.8-7.5c.3-.1.5.2.3.5l-3.2 4.4c-.1.2-.3.3-.5.3H8.3c-.1 0-.2-.1-.2-.1zm19.9 2.5L8.2 23.9c-.2.2-.5.1-.6-.1l-1-3.4c-.1-.3.2-.5.5-.4l19.8 7.5c.3.1.4.5.2.7z"
      />
    </svg>
  );
}

function AssetIcon({ symbol }: { symbol: string }) {
  if (symbol === "SOL") return <SolanaLogo />;
  return (
    <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
      $
    </div>
  );
}

export default function SupportedAssets() {
  return (
    <section className="landing-section relative py-20 border-t landing-border">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="landing-label">Supported assets</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
            Built on Solana today
          </h2>
          <p className="mt-4 landing-body">
            Trezalink routes payments on Solana mainnet. Additional networks and stablecoins
            will roll out as we expand the platform.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <ScrollReveal variant="left" className="landing-panel rounded-2xl p-6 md:p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/20">
                <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold landing-heading">Blockchain networks</h3>
                <p className="text-xs landing-subtle mt-0.5">Where transactions settle</p>
              </div>
            </div>
            <ul className="space-y-3">
              {NETWORKS.map((network) => (
                <li key={network.id} className="flex items-start gap-4 p-4 rounded-xl landing-panel-muted">
                  <SolanaLogo />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold landing-heading">{network.name}</span>
                      <span className="text-xs landing-subtle font-mono">{network.chainId}</span>
                      <StatusBadge status={network.status} />
                    </div>
                    <p className="text-sm landing-body">{network.description}</p>
                  </div>
                </li>
              ))}
              <li className="flex items-center gap-3 p-4 rounded-xl border border-dashed landing-border text-sm landing-muted">
                <span className="text-lg opacity-40">+</span>
                More networks planned — follow our changelog for updates.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-6 md:p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold landing-heading">Crypto currencies</h3>
                <p className="text-xs landing-subtle mt-0.5">Assets you can collect</p>
              </div>
            </div>
            <ul className="space-y-3">
              {CURRENCIES.map((currency) => (
                <li key={currency.id} className="flex items-start gap-4 p-4 rounded-xl landing-panel-muted">
                  <AssetIcon symbol={currency.symbol} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold landing-heading font-mono">{currency.symbol}</span>
                      <span className="text-xs landing-subtle">{currency.name}</span>
                      <StatusBadge status={currency.status} />
                    </div>
                    <p className="text-sm landing-body">{currency.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
