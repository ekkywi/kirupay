"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

type MemberRow = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  merchant: { id: string; email: string; businessName: string };
};

export default function BusinessMembersPage() {
  const [businessId, setBusinessId] = useState("");
  const [rows, setRows] = useState<MemberRow[]>([]);

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
    if (!businessId) return;
    await fetch(`/api/merchant/businesses/${businessId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          <Users className="h-4 w-4" />
          Business members
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Manage member roles</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.merchant.businessName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.merchant.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={row.role}
                    onChange={(event) => void patchMember(row.id, { role: event.target.value as "OWNER" | "ADMIN" | "MEMBER" })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-[#0B0F17]"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                  <button
                    onClick={() => void patchMember(row.id, { isActive: !row.isActive })}
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
