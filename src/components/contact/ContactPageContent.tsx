"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type ContactState = "idle" | "submitting" | "success" | "error";

const TOPICS = [
  "General inquiry",
  "Technical support",
  "Security report",
  "Partnership",
  "Billing",
] as const;

export default function ContactPageContent() {
  const [state, setState] = useState<ContactState>("idle");
  const [error, setError] = useState<string>("");

  const isBusy = state === "submitting";
  const statusCopy = useMemo(() => {
    if (state === "success") return "Message sent. Our team will respond as soon as possible.";
    if (state === "error") return error || "Unable to send your message right now. Please try again.";
    return "";
  }, [state, error]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      topic: String(formData.get("topic") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setState("error");
        setError(data?.message || "Unable to send your message right now. Please try again.");
        return;
      }

      event.currentTarget.reset();
      setState("success");
    } catch {
      setState("error");
      setError("Unable to send your message right now. Please try again.");
    }
  }

  return (
    <section className="landing-panel rounded-3xl p-7 md:p-10">
      <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Contact and support</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Talk with Trezalink support</h1>
      <p className="mt-4 text-sm landing-body max-w-2xl">
        Use this form for product questions, technical issues, or operational requests. For sensitive security reports,
        choose the security topic and include reproducible details.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold landing-heading mb-1.5">Full name</label>
            <input id="name" name="name" required className="w-full rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/70" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold landing-heading mb-1.5">Work email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/70" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-semibold landing-heading mb-1.5">Company (optional)</label>
            <input id="company" name="company" className="w-full rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/70" />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-semibold landing-heading mb-1.5">Topic</label>
            <select id="topic" name="topic" required className="w-full rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/70">
              <option value="">Select a topic</option>
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold landing-heading mb-1.5">Message</label>
          <textarea id="message" name="message" required rows={6} className="w-full rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/70" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isBusy ? "Sending..." : "Send message"}
          </button>

          {state === "success" && (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              {statusCopy}
            </p>
          )}

          {state === "error" && (
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{statusCopy}</p>
          )}
        </div>
      </form>
    </section>
  );
}
