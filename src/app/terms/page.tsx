import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of Trezalink services.",
};

const UPDATED_AT = "May 25, 2026";

export default function TermsPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main className="relative z-10 pt-28 pb-14">
        <div className="max-w-4xl mx-auto px-6">
          <section className="landing-panel rounded-3xl p-7 md:p-10">
            <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Legal</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Terms of Service</h1>
            <p className="mt-3 text-sm landing-subtle">Last updated: {UPDATED_AT}</p>
            <div className="mt-8 space-y-6 text-sm landing-body">
              <section>
                <h2 className="text-lg font-semibold landing-heading">1. Service Scope</h2>
                <p className="mt-2">Trezalink provides non-custodial payment infrastructure, including checkout flows, merchant tooling, and operational APIs.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">2. Merchant Responsibilities</h2>
                <p className="mt-2">Merchants are responsible for account security, wallet key management, customer communication, lawful use of the platform, and accuracy of payment instructions.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">3. Non-Custodial Boundary</h2>
                <p className="mt-2">Trezalink does not custody merchant or payer assets. Settlement is wallet-direct and confirmed by on-chain transaction state.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">4. Fees</h2>
                <p className="mt-2">Current platform fee information is presented in our pricing materials. Network-level blockchain fees remain separate from Trezalink platform fees.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">5. Availability and Maintenance</h2>
                <p className="mt-2">We may perform maintenance or operational interventions. Current service health and incident updates are published on the public status page.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">6. Acceptable Use</h2>
                <p className="mt-2">You may not use the platform for unlawful, abusive, deceptive, or security-disruptive activities, including attempts to bypass controls or compromise service integrity.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">7. Limitation of Liability</h2>
                <p className="mt-2">To the maximum extent allowed by law, Trezalink is not liable for indirect, incidental, or consequential losses, including losses from external network outages or merchant key compromise.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">8. Changes to Terms</h2>
                <p className="mt-2">We may update these Terms periodically. Material updates will be reflected by the date above and may be communicated through product channels.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">9. Contact</h2>
                <p className="mt-2">Questions about these terms can be sent through our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact page</Link>.</p>
              </section>
            </div>
          </section>
        </div>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
