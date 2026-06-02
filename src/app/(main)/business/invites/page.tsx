"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

type BusinessMembershipSummary = {
  isCurrent?: boolean;
  business: {
    id: string;
    name: string;
    code: string;
  };
};

export default function BusinessInvitesPage() {
  const [joinCode, setJoinCode] = useState("");
  const [isJoiningBusiness, setIsJoiningBusiness] = useState(false);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [activeBusinessName, setActiveBusinessName] = useState<string | null>(null);

  const readApiMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") return fallback;
    const payload = body as { message?: string; error?: { message?: string } };
    return payload.error?.message || payload.message || fallback;
  };

  const loadBusinessContext = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as {
        activeBusinessId?: string | null;
        data?: BusinessMembershipSummary[];
      };
      const nextActiveBusinessId = json.activeBusinessId || null;
      const memberships = json.data || [];
      const activeMembership =
        memberships.find((membership) => membership.business.id === nextActiveBusinessId) ||
        memberships.find((membership) => membership.isCurrent);
      setActiveBusinessId(nextActiveBusinessId);
      setActiveBusinessName(activeMembership?.business.name || null);
    } catch {
      setActiveBusinessId(null);
      setActiveBusinessName(null);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBusinessContext();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadBusinessContext]);

  useEffect(() => {
    const onBusinessSwitch = () => {
      void loadBusinessContext();
    };
    window.addEventListener("merchant:business-switched", onBusinessSwitch);
    return () => {
      window.removeEventListener("merchant:business-switched", onBusinessSwitch);
    };
  }, [loadBusinessContext]);

  const joinBusiness = async () => {
    if (!joinCode.trim() || isJoiningBusiness) return;
    setIsJoiningBusiness(true);
    const toastId = toast.loading("Joining business...");
    try {
      const res = await fetch("/api/merchant/businesses/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim(), setActive: true }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to join business."), { id: toastId });
        return;
      }
      setJoinCode("");
      toast.success("Successfully joined business.", { id: toastId });
    } catch {
      toast.error("Failed to join business.", { id: toastId });
    } finally {
      setIsJoiningBusiness(false);
    }
  };

  const generateTargetHref = useMemo(() => {
    if (activeBusinessId) return `/business/manage/${activeBusinessId}`;
    return "/business";
  }, [activeBusinessId]);

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          <LinkIcon className="h-4 w-4" />
          Business invites
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Redeem invite code to join a business</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This is the neutral entry point for joining another business. Invite generation is available from each business manage page.
        </p>
      </div>

      <div className="dashboard-card p-5">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          <p>
            Need to generate invite code?{" "}
            <Link href={generateTargetHref} className="font-semibold text-blue-700 hover:underline dark:text-cyan-300">
              Open business manage
            </Link>
            {activeBusinessName ? ` for ${activeBusinessName}.` : "."}
          </p>
          {!activeBusinessId ? (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Active business is not selected yet. Open Business Hub to choose one, then continue to manage page.
            </p>
          ) : null}
        </div>
      </div>

      <div className="dashboard-card p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Join with invite code</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Paste a valid invite code from another business to join it.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="BIZ-XXXXXX-XXXXXX-XXXXXX" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]" />
          <button onClick={() => void joinBusiness()} disabled={isJoiningBusiness || !joinCode.trim()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-white/10">{isJoiningBusiness ? "Joining..." : "Join"}</button>
        </div>
      </div>
    </div>
  );
}
