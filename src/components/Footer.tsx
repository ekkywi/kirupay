import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-transparent pt-10 pb-8 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b landing-border">
          <div className="flex flex-col gap-2">
            <div className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500" />
              Trezalink
            </div>
            <p className="text-xs landing-muted max-w-xs">
            Global payments, borderless economy.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Product</p>
              <ul className="space-y-2 landing-muted">
                <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link href="/use-cases" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Use cases</Link></li>
                <li><Link href="/security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security</Link></li>
                <li><Link href="/status" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Resources</p>
              <ul className="space-y-2 landing-muted">
                <li><Link href="/architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Architecture</Link></li>
                <li><Link href="/developer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API</Link></li>
                <li><Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</Link></li>
                <li><Link href="/roadmap" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Roadmap</Link></li>
                <li><Link href="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Company</p>
              <ul className="space-y-2 landing-muted">
                <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Get started</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign in</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Community</p>
              <ul className="space-y-2 landing-muted">
                <li>
                  <Link href="https://github.com/trezanix" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="pt-6 text-xs landing-subtle text-center md:text-left">
          © {new Date().getFullYear()} Trezalink by Trezanix. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
