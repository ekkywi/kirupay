"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardSelect } from "@/components/dashboard/DashboardSelect";

type MemberRow = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  merchant: { id: string; email: string; businessName: string };
};

type PendingMemberAction =
  | { type: "toggle_active"; row: MemberRow; nextIsActive: boolean }
  | { type: "remove"; row: MemberRow }
  | { type: "change_role"; row: MemberRow; nextRole: "OWNER" | "ADMIN" | "MEMBER" };

export default function BusinessMembersPage() {
  const [businessId, setBusinessId] = useState("");
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [isMutatingMember, setIsMutatingMember] = useState(false);
  const [pendingMemberAction, setPendingMemberAction] = useState<PendingMemberAction | null>(null);
  const [showMemberActionModal, setShowMemberActionModal] = useState(false);

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

  const executePatchMember = async (memberId: string, payload: { role?: "OWNER" | "ADMIN" | "MEMBER"; isActive?: boolean }): Promise<boolean> => {
    try {
      const res = await fetch(`/api/merchant/businesses/${businessId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to update member."));
        return false;
      }
      await load();
      return true;
    } catch {
      toast.error("Failed to update member.");
      return false;
    }
  };

  const openMemberActionModal = (action: PendingMemberAction) => {
    if (isMutatingMember) return;
    setPendingMemberAction(action);
    setShowMemberActionModal(true);
  };

  const closeMemberActionModal = () => {
    if (isMutatingMember) return;
    setShowMemberActionModal(false);
    setPendingMemberAction(null);
  };

  const confirmMemberAction = async () => {
    if (!businessId || isMutatingMember || !pendingMemberAction) return;
    setIsMutatingMember(true);

    try {
      if (pendingMemberAction.type === "remove") {
        const res = await fetch(`/api/merchant/businesses/${businessId}/members/${pendingMemberAction.row.id}`, {
          method: "DELETE",
        });
        const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
        if (!res.ok) {
          toast.error(readApiMessage(json, "Failed to remove member."));
          return;
        }
        toast.success("Member removed.");
        await load();
        return;
      }

      if (pendingMemberAction.type === "toggle_active") {
        const ok = await executePatchMember(pendingMemberAction.row.id, { isActive: pendingMemberAction.nextIsActive });
        if (ok) {
          toast.success(pendingMemberAction.nextIsActive ? "Member activated." : "Member deactivated.");
        }
        return;
      }

      const ok = await executePatchMember(pendingMemberAction.row.id, { role: pendingMemberAction.nextRole });
      if (ok) {
        toast.success(`Member role updated to ${pendingMemberAction.nextRole}.`);
      }
    } finally {
      setShowMemberActionModal(false);
      setPendingMemberAction(null);
      setIsMutatingMember(false);
    }
  };

  const getMemberActionModalContent = () => {
    if (!pendingMemberAction) {
      return {
        title: "Confirm action",
        description: "",
        confirmLabel: "Confirm",
        confirmClassName: "bg-blue-600 hover:bg-blue-700",
      };
    }

    if (pendingMemberAction.type === "remove") {
      return {
        title: "Remove member",
        description: `Remove ${pendingMemberAction.row.merchant.email} from this business permanently?`,
        confirmLabel: "Yes, Remove",
        confirmClassName: "bg-red-600 hover:bg-red-700",
      };
    }

    if (pendingMemberAction.type === "toggle_active") {
      const nextLabel = pendingMemberAction.nextIsActive ? "activate" : "deactivate";
      return {
        title: pendingMemberAction.nextIsActive ? "Reactivate member" : "Deactivate member",
        description: `Are you sure you want to ${nextLabel} ${pendingMemberAction.row.merchant.email}?`,
        confirmLabel: pendingMemberAction.nextIsActive ? "Yes, Activate" : "Yes, Deactivate",
        confirmClassName: pendingMemberAction.nextIsActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700",
      };
    }

    return {
      title: "Change member role",
      description: `Change role for ${pendingMemberAction.row.merchant.email} from ${pendingMemberAction.row.role} to ${pendingMemberAction.nextRole}?`,
      confirmLabel: "Yes, Change Role",
      confirmClassName: "bg-blue-600 hover:bg-blue-700",
    };
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
                  <DashboardSelect
                    value={row.role}
                    onValueChange={(value) =>
                      openMemberActionModal({
                        type: "change_role",
                        row,
                        nextRole: value as "OWNER" | "ADMIN" | "MEMBER",
                      })
                    }
                    disabled={isMutatingMember}
                    options={[
                      { value: "OWNER", label: "OWNER" },
                      { value: "ADMIN", label: "ADMIN" },
                      { value: "MEMBER", label: "MEMBER" },
                    ]}
                    className="px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    onClick={() =>
                      openMemberActionModal({
                        type: "toggle_active",
                        row,
                        nextIsActive: !row.isActive,
                      })
                    }
                    disabled={isMutatingMember}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-white/10"
                  >
                    {row.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openMemberActionModal({ type: "remove", row })}
                    disabled={isMutatingMember}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:text-rose-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No members found.</p>}
        </div>
      </div>

      {showMemberActionModal && pendingMemberAction ? (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-surface">
            <div className="relative p-6 pb-3 text-center">
              <button
                onClick={closeMemberActionModal}
                disabled={isMutatingMember}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X size={18} />
              </button>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{getMemberActionModalContent().title}</h3>
            </div>
            <div className="px-6 pb-6 text-center">
              <p className="break-words whitespace-normal text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {getMemberActionModalContent().description}
              </p>
            </div>
            <div className="dashboard-modal-footer">
              <button
                onClick={closeMemberActionModal}
                disabled={isMutatingMember}
                className="order-2 w-full dashboard-secondary px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmMemberAction()}
                disabled={isMutatingMember}
                className={`order-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 sm:order-2 ${getMemberActionModalContent().confirmClassName}`}
              >
                {isMutatingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {getMemberActionModalContent().confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
