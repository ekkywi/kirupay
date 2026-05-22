import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import { ArrowRight, Check, FileCheck, Fingerprint, KeyRound, Lock, ShieldCheck, Wallet, Webhook } from "lucide-react";

export const metadata: Metadata = {
  title: "Security",
};

const CONTROLS = [
  { icon: Wallet, title: "Non-custodial settlement", desc: "Trezalink coordinates payments without storing merchant balances or private keys." },
  { icon: KeyRound, title: "Rotatable API keys", desc: "Merchants can regenerate live API keys from the developer console." },
  { icon: Webhook, title: "HMAC webhooks", desc: "Webhook payloads are signed with X-Trezalink-Signature when a secret is configured." },
  { icon: FileCheck, title: "Duplicate order protection", desc: "The checkout API rejects reused orderId values for the same merchant." },
];

export default function SecurityPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
            <ScrollReveal immediate className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" /> Security
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                <span className="gradient-text">Security starts with</span>
                <br />
                <span className="landing-heading">not holding merchant funds</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                Trezalink keeps the sensitive boundaries clear: payer authorization happens in the wallet,
                settlement goes to the merchant wallet, and backend integrations use scoped credentials.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/architecture" className="landing-btn-primary">View architecture <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/docs" className="landing-btn-secondary">Read docs</Link>
              </div>
            </ScrollReveal>
            <ScrollReveal immediate delay={120} variant="right" className="landing-panel rounded-2xl p-8">
              <p className="text-xs landing-subtle uppercase tracking-wider font-semibold mb-5">Trust boundaries</p>
              {["Private keys remain with wallets", "API key required for checkout creation", "Webhook signature verifies event origin", "Transaction records preserve audit data"].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b landing-border py-4 first:pt-0 last:border-0 last:pb-0">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm landing-body">{item}</span>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Controls</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Protection built into product flows</h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTROLS.map((control, index) => (
                <ScrollReveal key={control.title} delay={index * 80} className="landing-panel rounded-2xl p-6 h-full">
                  <control.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-6" />
                  <h3 className="font-semibold landing-heading mb-2">{control.title}</h3>
                  <p className="text-sm landing-body">{control.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="left">
              <span className="landing-label">Responsibility model</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">Clear ownership for each secret</h2>
              <p className="landing-body">Merchants protect API keys, webhook secrets, and settlement wallets. Trezalink provides rotation, signing, logs, and validation boundaries inside the app.</p>
            </ScrollReveal>
            <ScrollReveal variant="right" className="landing-panel rounded-2xl p-8">
              {[
                { icon: Fingerprint, label: "API key", value: "Used by backend checkout requests" },
                { icon: Lock, label: "Webhook secret", value: "Used to verify event signatures" },
                { icon: Wallet, label: "Wallet key", value: "Never handled by Trezalink" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4 border-b landing-border py-4 first:pt-0 last:border-0 last:pb-0">
                  <row.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div><p className="font-semibold landing-heading">{row.label}</p><p className="text-sm landing-body">{row.value}</p></div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}