import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, Code2, Globe2, Link as LinkIcon, Radio, Wallet } from "lucide-react";

const FEATURES = [
  { name: "SOL payments", status: "Live", icon: Wallet },
  { name: "Solana settlement", status: "Live", icon: Globe2 },
  { name: "Payment links", status: "Live", icon: LinkIcon },
  { name: "Checkout API", status: "Live", icon: Code2 },
  { name: "Signed webhooks", status: "Live", icon: Radio },
  { name: "USDC SPL", status: "Planned", icon: Clock },
];

export default function StatusPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <ScrollReveal immediate className="max-w-3xl text-center mx-auto">
              <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                <BadgeCheck className="w-3.5 h-3.5" /> Supported status
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]">
                <span className="gradient-text">What is live today</span>
                <br />
                <span className="landing-heading">and what is planned next</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl landing-body">
                A clear snapshot of supported networks, assets, and product capabilities so merchants know exactly what to expect.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((feature, index) => (
                <ScrollReveal key={feature.name} delay={index * 70} className="landing-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${feature.status === "Live" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}>
                      {feature.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold landing-heading">{feature.name}</h2>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16">
              <span className="landing-label">Current scope</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">SOL-first by design</h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-8">Trezalink is currently focused on SOL checkout reliability before expanding into additional SPL assets.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/roadmap" className="landing-btn-primary">View roadmap <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/pricing" className="landing-btn-secondary">See pricing</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
