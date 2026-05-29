"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

type MemberRow = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  merchant: { id: string; email: string; businessName: string };
};

export default function BusinessMembersPage() {
  const [businessId, setBusinessId] = useState("");
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [isPatchingMember, setIsPatchingMember] = useState(false);

  const readApiMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") return fallback;
    const payload = body as { message?: string; error?: { message?: string } };
    return payload.error?.message || payload.message || fallback;
  };

  const load = useCallback(async () => {
    const ctxRes = await fetch("/api/merchant/businesses", { cache: "no-store" });
    const ctxJson = (await ctxRes.json()) as { activeBusinessId?: string; data?: Array<{ isCurrent: boolean; business: { id: string } }> };
    const activeId = ctxJson.activeBusinessId || ctxJson.data?.find((item) => item.isCurrent)?.business.id || "";
    if (!activeId) return;
    setBusinessId(activeId);

    const res = await fetch(`/api/merchant/businesses/${activeId}/members`, { cache: "no-store" });
    const json = (await res.json()) as { data?: MemberRow[] };
    setRows(json.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const patchMember = async (memberId: string, payload: { role?: "OWNER" | "ADMIN" | "MEMBER"; isActive?: boolean }) => {
    if (!businessId || isPatchingMember) return;
    setIsPatchingMember(true);
    try {
      const res = await fetch(`/api/merchant/businesses/${businessId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to update member."));
        return;
      }
      await load();
    } catch {
      toast.error("Failed to update member.");
    } finally {
      setIsPatchingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          <Users className="h-4 w-4" />
          Business members
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Manage member roles</h1>
      </div>

      <div className="dashboard-card p-5">
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.merchant.businessName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.merchant.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={row.role}
                    onChange={(event) => void patchMember(row.id, { role: event.target.value as "OWNER" | "ADMIN" | "MEMBER" })}
                    disabled={isPatchingMember}
                    className="rounded-lg border border-blue-900/10 bg-white/70 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/[0.045]"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                  <button
                    onClick={() => void patchMember(row.id, { isActive: !row.isActive })}
                    disabled={isPatchingMember}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-white/10"
                  >
                    {row.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No members found.</p>}
        </div>
      </div>
    </div>
  );
}
