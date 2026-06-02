import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Product and platform updates for Trezalink.",
};

type ChangelogEntry = {
  date: string;
  category: "Feature" | "Ops" | "Fix" | "Docs";
  title: string;
  summary: string;
};

const ENTRIES: ChangelogEntry[] = [
  {
    date: "May 25, 2026",
    category: "Feature",
    title: "Trust and legal page rollout",
    summary: "Launched Trust Center, Privacy Policy, Terms of Service, Contact/Support page, and public Changelog for global trust readiness.",
  },
  {
    date: "May 25, 2026",
    category: "Ops",
    title: "Navigation information architecture refresh",
    summary: "Reorganized topbar and footer into Product, Developers, Trust, and Company sections for faster information discovery.",
  },
  {
    date: "May 23, 2026",
    category: "Feature",
    title: "Business invite and membership flow",
    summary: "Added business invite management and membership endpoints to support multi-entity merchant operations.",
  },
  {
    date: "May 22, 2026",
    category: "Ops",
    title: "Webhook recovery improvements",
    summary: "Extended retry and recovery handling for failed webhook deliveries and operational incident follow-up.",
  },
  {
    date: "May 20, 2026",
    category: "Feature",
    title: "Public status and maintenance controls",
    summary: "Expanded status visibility and maintenance tooling to improve incident communication and operator response workflows.",
  },
  {
    date: "May 19, 2026",
    category: "Docs",
    title: "Reporting and status documentation updates",
    summary: "Updated docs for reporting exports, status interpretation, and maintenance-related operational guidance.",
  },
];

function categoryTone(category: ChangelogEntry["category"]) {
  if (category === "Feature") return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  if (category === "Ops") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  if (category === "Fix") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";
}

export default function ChangelogPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main className="relative z-10 pt-28 pb-14">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal immediate className="landing-panel rounded-3xl p-7 md:p-10">
            <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Product updates</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Changelog</h1>
            <p className="mt-4 text-sm landing-body">Release notes and operational updates in reverse chronological order.</p>
          </ScrollReveal>

          <div className="mt-6 space-y-4">
            {ENTRIES.map((entry, index) => (
              <ScrollReveal key={`${entry.date}-${entry.title}`} delay={index * 45} className="landing-panel rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryTone(entry.category)}`}>{entry.category}</span>
                  <span className="text-xs landing-subtle">{entry.date}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold landing-heading">{entry.title}</h2>
                <p className="mt-2 text-sm landing-body">{entry.summary}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
