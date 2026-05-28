import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, LockKeyhole, WalletCards, Zap } from "lucide-react";

const TRUST_STRIP = [
  { label: "Non-custodial", icon: LockKeyhole },
  { label: "Transparent 0.3% fee", icon: BadgeCheck },
  { label: "Solana mainnet", icon: Zap },
  { label: "Direct wallet settlement", icon: WalletCards },
];

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/security", label: "Security" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/developer", label: "API" },
      { href: "/architecture", label: "Architecture" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/trust", label: "Trust Center" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/roadmap", label: "Roadmap" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-transparent pb-8 pt-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="landing-final mb-6 grid gap-8 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2.5 text-base font-black tracking-tight text-slate-950 dark:text-white">
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_32%_28%,#67e8f9,transparent_34%),linear-gradient(135deg,#34d399,#059669)]" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-white dark:bg-slate-950" />
              </span>
              Trezalink
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-3xl dark:text-white">
              Lightweight Solana payment infrastructure for merchant teams.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Launch checkout fast, keep custody, and settle global customer payments directly to your wallet.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href="/register" className="landing-btn-primary px-6 py-3">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/docs/quickstart" className="landing-btn-secondary px-6 py-3">
              Read quickstart
            </Link>
          </div>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-white/70 bg-white/52 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {TRUST_STRIP.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-10 border-b border-slate-200/70 pb-8 dark:border-white/10 lg:flex-row">
          <div className="max-w-sm">
            <p className="landing-label">Global payments</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Non-custodial checkout links, signed webhooks, and operational visibility for teams building on Solana.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-black text-emerald-800 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-200">
              <Globe2 className="h-3.5 w-3.5" />
              Borderless by default
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-8 text-sm md:grid-cols-4 lg:w-auto">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-3 font-black text-slate-950 dark:text-white">{group.title}</p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-semibold transition-colors hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="pt-6 text-center text-xs text-slate-400 dark:text-slate-500 md:text-left">
          © {new Date().getFullYear()} Trezalink by Trezanix. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
