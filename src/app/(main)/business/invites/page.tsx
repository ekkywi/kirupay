"use client";

import { useCallback, useEffect, useState } from "react";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

type InviteRow = {
  id: string;
  role: "ADMIN" | "MEMBER";
  codeHint: string;
  expiresAt: string;
  usedAt: string | null;
};

export default function BusinessInvitesPage() {
  const [items, setItems] = useState<InviteRow[]>([]);
  const [lastCode, setLastCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isJoiningBusiness, setIsJoiningBusiness] = useState(false);

  const readApiMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") return fallback;
    const payload = body as { message?: string; error?: { message?: string } };
    return payload.error?.message || payload.message || fallback;
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/merchant/businesses/invites", { cache: "no-store" });
    const json = (await res.json()) as { data?: InviteRow[] };
    setItems(json.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const createInvite = async () => {
    if (isCreatingInvite) return;
    setIsCreatingInvite(true);
    const toastId = toast.loading("Generating invite code...");
    try {
      const res = await fetch("/api/merchant/businesses/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, expiresInHours: 72 }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { code?: string }; message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to create invite."), { id: toastId });
        return;
      }
      setLastCode(json.data?.code || "");
      await load();
      toast.success("Invite code generated.", { id: toastId });
    } catch {
      toast.error("Failed to create invite.", { id: toastId });
    } finally {
      setIsCreatingInvite(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          <LinkIcon className="h-4 w-4" />
          Business invites
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Generate and redeem invite codes</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="dashboard-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create invite code</p>
          <div className="mt-3 flex items-center gap-2">
            <select value={role} onChange={(event) => setRole(event.target.value as "ADMIN" | "MEMBER")} className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]">
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button onClick={() => void createInvite()} disabled={isCreatingInvite} className="rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:via-violet-700 hover:to-cyan-700 disabled:opacity-50">{isCreatingInvite ? "Generating..." : "Generate"}</button>
          </div>
          {lastCode && <p className="mt-3 rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700 dark:bg-white/[0.03] dark:text-slate-200">{lastCode}</p>}
        </div>

        <div className="dashboard-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Join with invite code</p>
          <div className="mt-3 flex items-center gap-2">
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="BIZ-XXXXXX-XXXXXX-XXXXXX" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]" />
            <button onClick={() => void joinBusiness()} disabled={isJoiningBusiness || !joinCode.trim()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-white/10">{isJoiningBusiness ? "Joining..." : "Join"}</button>
          </div>
        </div>
      </div>

      <div className="dashboard-card p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent invites</p>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-blue-900/10 bg-emerald-50/35 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-semibold text-slate-800 dark:text-slate-100">Role {item.role} • code ending {item.codeHint}</p>
              <p className="text-slate-500 dark:text-slate-400">Expires: {new Date(item.expiresAt).toLocaleString()} • {item.usedAt ? "Used" : "Pending"}</p>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No invites yet.</p>}
        </div>
      </div>
    </div>
  );
}
