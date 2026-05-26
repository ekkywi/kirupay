import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trezalink collects, uses, and protects personal and operational data.",
};

const UPDATED_AT = "May 25, 2026";

export default function PrivacyPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main className="relative z-10 pt-28 pb-14">
        <div className="max-w-4xl mx-auto px-6">
          <section className="landing-panel rounded-3xl p-7 md:p-10">
            <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Legal</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Privacy Policy</h1>
            <p className="mt-3 text-sm landing-subtle">Last updated: {UPDATED_AT}</p>
            <p className="mt-5 text-sm landing-body">
              This Privacy Policy explains how Trezalink collects and processes information when you use our website,
              merchant onboarding flow, hosted checkout pages, and related support channels.
            </p>

            <div className="mt-8 space-y-6 text-sm landing-body">
              <section>
                <h2 className="text-lg font-semibold landing-heading">1. Information We Collect</h2>
                <p className="mt-2">We may collect account details, business profile information, wallet identifiers, technical logs, and support communications required to operate and secure the platform.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">2. How We Use Information</h2>
                <p className="mt-2">We use data to provide checkout services, verify account ownership, monitor service reliability, prevent abuse, and respond to support requests.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">3. Custody and Transaction Data</h2>
                <p className="mt-2">Trezalink is non-custodial. We do not hold customer funds. Transaction metadata and delivery logs are processed to support settlement visibility, reconciliation, and webhook reliability.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">4. Sharing and Service Providers</h2>
                <p className="mt-2">We share limited data with infrastructure providers needed to run core services, such as hosting, database, and email delivery partners. We do not sell personal data.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">5. Security Controls</h2>
                <p className="mt-2">We apply technical and operational safeguards designed to protect account and operational data, including authentication controls, access boundaries, and monitoring workflows.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">6. Data Retention</h2>
                <p className="mt-2">We retain information for as long as needed to operate the service, meet legal obligations, resolve disputes, and maintain security and auditability.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">7. Your Rights and Requests</h2>
                <p className="mt-2">You can request account-related updates through our support channel. We may require verification before processing sensitive requests.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">8. International Use</h2>
                <p className="mt-2">Our services are available globally. By using Trezalink, you understand that data may be processed in jurisdictions where our providers operate.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold landing-heading">9. Contact</h2>
                <p className="mt-2">Privacy inquiries can be sent through our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact page</Link>.</p>
              </section>
            </div>
          </section>
        </div>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
