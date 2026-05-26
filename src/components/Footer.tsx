import Link from "next/link";

const TRUST_STRIP = ["Non-custodial", "Transparent 0.3% fee", "Solana mainnet"];

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
    <footer className="relative bg-transparent pt-10 pb-8 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-2xl border landing-border bg-white/75 dark:bg-white/[0.03] backdrop-blur-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            {TRUST_STRIP.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/85 dark:bg-white/[0.05] border landing-border"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pb-8 border-b landing-border">
          <div className="flex flex-col gap-3 max-w-sm">
            <div className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
              Trezalink
            </div>
            <p className="text-sm landing-muted">
              Global crypto payments for modern merchants. Launch checkout fast, keep custody,
              and settle directly to your wallet.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/register"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border landing-border px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/8 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="font-semibold text-slate-900 dark:text-white mb-3">{group.title}</p>
                <ul className="space-y-2 landing-muted">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

        <p className="pt-6 text-xs landing-subtle text-center md:text-left">
          © {new Date().getFullYear()} Trezalink by Trezanix. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
