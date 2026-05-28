import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { DOCS_NAV } from "@/lib/docs-nav";
import Link from "next/link";
import { ArrowRight, BookOpenText, Code2, ShieldCheck } from "lucide-react";
import "./docs.css";

export const metadata: Metadata = {
  title: "Docs",
};

const HEADER_LINKS = DOCS_NAV.slice(0, 4);

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-root docs-shell relative min-h-screen overflow-x-hidden selection:bg-emerald-400/25">
      <PageBackground />
      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main className="docs-container relative z-10 pt-28 pb-14">
        <div className="docs-header-card mb-6 overflow-hidden px-5 py-5 sm:px-6 lg:px-7">
          <div className="docs-header-glow docs-header-glow-left" />
          <div className="docs-header-glow docs-header-glow-right" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="landing-pill inline-flex items-center gap-2">
                <BookOpenText className="h-3.5 w-3.5" />
                Documentation
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl dark:text-white">
                Build with Trezalink without losing the thread.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                Structured guides for Solana checkout, payment links, webhooks, security boundaries, operations, and diagnostics.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[25rem]">
              {[
                { icon: Code2, label: "Integrate", value: "Checkout API" },
                { icon: ShieldCheck, label: "Operate", value: "Security + status" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.25rem] border border-slate-200/80 bg-white/68 p-4 dark:border-white/10 dark:bg-white/[0.045]">
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    <p className="mt-4 text-[0.68rem] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">
            {HEADER_LINKS.map((item) => (
              <Link key={item.slug} href={`/docs/${item.slug}`} className="docs-quick-link">
                {item.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="docs-main-grid">
          <DocsSidebar nav={DOCS_NAV} />
          <div>{children}</div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f6f4ee] dark:border-white/10 dark:bg-[#040807]">
        <Footer />
      </footer>
    </div>
  );
}
