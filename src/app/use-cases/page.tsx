import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Check, Globe2, Layers3, Store, Users } from "lucide-react";

const USE_CASES = [
  { icon: BriefcaseBusiness, title: "Freelancers", desc: "Collect cross-border SOL payments with a hosted payment link and direct wallet settlement.", points: ["No-code payment links", "Customer email reference", "Simple gross-to-net records"] },
  { icon: Users, title: "Agencies", desc: "Issue project or retainer payment links while keeping finance visibility in the dashboard.", points: ["Unique order IDs", "Payment history", "Webhook notifications"] },
  { icon: Building2, title: "SaaS teams", desc: "Create checkout sessions from backend services and reconcile paid accounts through webhooks.", points: ["Checkout API", "Bearer API keys", "payment.success events"] },
  { icon: Store, title: "Marketplaces", desc: "Prototype Solana-native collections before building deeper marketplace payment workflows.", points: ["Hosted checkout", "Transaction logs", "Admin oversight"] },
  { icon: Globe2, title: "Remote teams", desc: "Accept wallet-direct payments from global clients without correspondent banking delays.", points: ["SOL settlement", "Final payments", "Dashboard reporting"] },
  { icon: Layers3, title: "Developer-led products", desc: "Use Trezalink as the payment layer while your app owns the customer experience.", points: ["REST checkout", "Redirect URLs", "Webhook logs"] },
];

export default function UseCasesPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal immediate>
              <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                <BriefcaseBusiness className="w-3.5 h-3.5" /> Use cases
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]">
                <span className="gradient-text">Payment workflows</span>
                <br />
                <span className="landing-heading">for modern internet teams</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl landing-body">Trezalink fits teams that need fast wallet-direct collections, simple payment links, and an API path for deeper automation.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 60} className="landing-panel rounded-2xl p-6 h-full">
                <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-5" />
                <h2 className="text-lg font-semibold landing-heading mb-2">{item.title}</h2>
                <p className="text-sm landing-body mb-6">{item.desc}</p>
                <div className="space-y-3">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-center gap-2.5 text-xs landing-body">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {point}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">Start simple, automate later</h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">Use payment links today, then graduate to checkout API and webhooks as your product workflow matures.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="landing-btn-primary">Open merchant account <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/developer" className="landing-btn-secondary">Explore API</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
