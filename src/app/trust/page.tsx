import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import { ArrowRight, FileCheck2, ShieldCheck, Wallet, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust Center",
  description: "Security boundaries, custody model, operational posture, and trust resources for Trezalink.",
};

const TRUST_PILLARS = [
  {
    icon: Wallet,
    title: "Non-custodial by design",
    body: "Customer funds are not held by Trezalink. Settlement is directed to merchant-configured wallets.",
  },
  {
    icon: ShieldCheck,
    title: "Security-first controls",
    body: "Current flows include account auth controls, webhook signing, and explicit boundaries between platform and merchant secrets.",
  },
  {
    icon: Wrench,
    title: "Operational transparency",
    body: "Public status and maintenance communications are available so teams can monitor conditions and respond faster.",
  },
  {
    icon: FileCheck2,
    title: "Compliance posture",
    body: "We publish current practices and roadmap intent. We avoid claiming certifications that are not formally completed.",
  },
];

export default function TrustPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative pt-28 pb-12">
          <div className="max-w-6xl mx-auto px-6">
            <ScrollReveal immediate className="landing-panel rounded-3xl p-8 md:p-10">
              <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Trust Center</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Trust information for merchants and integration teams</h1>
              <p className="mt-4 text-sm md:text-base landing-body max-w-3xl">
                This page summarizes how Trezalink approaches custody boundaries, security controls,
                operational communication, and compliance posture in the current product stage.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative pb-10">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-5">
            {TRUST_PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.title} delay={index * 70} className="landing-panel rounded-2xl p-6">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="mt-4 text-lg font-semibold landing-heading">{pillar.title}</h2>
                  <p className="mt-2 text-sm landing-body">{pillar.body}</p>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="landing-section relative py-10">
          <div className="max-w-6xl mx-auto px-6">
            <ScrollReveal className="landing-panel rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl font-bold landing-heading">Policy and references</h2>
              <p className="mt-3 text-sm landing-body">
                For legal, incident communication, and implementation references, use the resources below.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/status", label: "Public Status" },
                  { href: "/docs/security", label: "Security Docs" },
                ].map((item) => (
                  <TrackingLink
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center justify-between rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-4 py-3 text-sm font-semibold landing-heading hover:bg-slate-100/80 dark:hover:bg-white/7 transition-colors"
                    eventName="cta_click"
                    eventData={{ placement: "trust_center_resource" }}
                  >
                    {item.label}
                    <ArrowRight className="w-4 h-4" />
                  </TrackingLink>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
