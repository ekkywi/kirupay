import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

const FAQS = [
  ["Does Trezalink hold merchant funds?", "No. Trezalink is designed around wallet-direct settlement. Funds move to the merchant wallet after the payer completes checkout."],
  ["What asset is supported today?", "SOL is supported today. USDC SPL is planned for a later roadmap phase."],
  ["How much does Trezalink charge?", "The platform fee is 0.3% per successful transaction. There are no setup fees or monthly minimums shown in the current product."],
  ["Can I create payments without code?", "Yes. Merchants can create manual payment links from the dashboard."],
  ["Can I integrate from my backend?", "Yes. Use POST /api/v1/checkout with Authorization: Bearer <API_KEY> to create hosted checkout sessions."],
  ["How do webhooks work?", "When payment is confirmed, Trezalink sends a payment.success event to the configured webhook URL and signs it with X-Trezalink-Signature when a secret exists."],
  ["What happens with duplicate order IDs?", "The checkout API and payment-link flow check for duplicate orderId values per merchant to avoid accidental duplicate records."],
  ["Where can I inspect payment history?", "The merchant dashboard includes payment records, payment-link records, analytics, and webhook logs."],
];

export default function FAQPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal immediate>
              <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                <HelpCircle className="w-3.5 h-3.5" /> FAQ
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]">
                <span className="gradient-text">Answers before</span>
                <br />
                <span className="landing-heading">you start integrating</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl landing-body">The most common questions about Trezalink payments, fees, API usage, webhooks, and supported assets.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-4">
              {FAQS.map(([question, answer], index) => (
                <ScrollReveal key={question} delay={index * 45} className="landing-panel rounded-2xl p-6">
                  <h2 className="text-lg font-semibold landing-heading">{question}</h2>
                  <p className="mt-3 landing-body">{answer}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">Ready to try the current stack?</h2>
              <Link href="/register" className="landing-btn-primary">Create merchant account <ArrowRight className="w-4 h-4" /></Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
