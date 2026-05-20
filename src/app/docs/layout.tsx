import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { DOCS_NAV } from "@/lib/docs-nav";
import Link from "next/link";
import "./docs.css";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-root docs-shell relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main className="docs-container relative z-10 pt-24 pb-14">
        <div className="docs-header-card mb-6 overflow-hidden px-5 py-4 sm:px-6">
          <div className="pointer-events-none absolute h-0 w-0" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Documentation</p>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight landing-heading">Trezalink Docs</h1>
              <p className="mt-1 text-sm landing-body">Structured guides for integration, operations, and diagnostics.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {DOCS_NAV.slice(0, 4).map((item) => (
              <Link
                key={item.slug}
                href={`/docs/${item.slug}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="docs-main-grid">
          <DocsSidebar nav={DOCS_NAV} />
          <div>{children}</div>
        </div>
      </main>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]">
        <Footer />
      </footer>
    </div>
  );
}
