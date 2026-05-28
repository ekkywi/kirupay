"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, KeyRound, LinkIcon, Loader2, Users, Wallet, X } from "lucide-react";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { DeveloperView } from "@/components/dashboard/developers/DeveloperView";
import { toast } from "sonner";

type TabId = "entity" | "members" | "invites" | "wallet" | "integrations";

type ManageContext = {
  membership: { id: string; role: "OWNER" | "ADMIN" | "MEMBER"; isActive: boolean };
  business: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    contactEmail: string | null;
    settlementWalletAddress: string | null;
    apiKey: string | null;
    webhookUrl: string | null;
    webhookSecret: string | null;
  };
};

type MemberRow = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  merchant: { id: string; email: string; businessName: string };
};

type InviteRow = {
  id: string;
  role: "ADMIN" | "MEMBER";
  codeHint: string;
  expiresAt: string;
  usedAt: string | null;
};

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "entity", label: "Entity", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "invites", label: "Invites", icon: LinkIcon },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "integrations", label: "Integrations", icon: KeyRound },
];

export default function BusinessManagePage() {
  const params = useParams<{ businessId: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const businessId = params.businessId;

  const [activeTab, setActiveTab] = useState<TabId>("entity");
  const [ctx, setCtx] = useState<ManageContext | null>(null);
  const [editingName, setEditingName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [joinCode, setJoinCode] = useState("");
  const [lastCode, setLastCode] = useState("");
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isPatchingMember, setIsPatchingMember] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isJoiningBusiness, setIsJoiningBusiness] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  const role = ctx?.membership.role;
  const isOwner = role === "OWNER";
  const canManageBusiness = isOwner;
  const trimmedEditingName = editingName.trim();
  const profileChanged = trimmedEditingName !== (ctx?.business.name ?? "");
  const readApiMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") return fallback;
    const payload = body as { message?: string; error?: { message?: string } };
    return payload.error?.message || payload.message || fallback;
  };

  const loadManage = useCallback(async () => {
    const res = await fetch(`/api/merchant/businesses/${businessId}/manage`, { cache: "no-store" });
    const json = (await res.json()) as { data?: ManageContext };
    const next = json.data || null;
    setCtx(next);
    setEditingName(next?.business.name || "");
    setWebhookUrl(next?.business.webhookUrl || "");
  }, [businessId]);

  const loadMembers = useCallback(async () => {
    const res = await fetch(`/api/merchant/businesses/${businessId}/members`, { cache: "no-store" });
    const json = (await res.json()) as { data?: MemberRow[] };
    setMembers(json.data || []);
  }, [businessId]);

  const loadInvites = useCallback(async () => {
    const res = await fetch(`/api/merchant/businesses/invites?businessId=${encodeURIComponent(businessId)}`, { cache: "no-store" });
    const json = (await res.json()) as { data?: InviteRow[] };
    setInvites(json.data || []);
  }, [businessId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadManage();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [businessId, loadManage, pathname, searchParamsKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (activeTab === "members") void loadMembers();
      if (activeTab === "invites") void loadInvites();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, businessId, loadInvites, loadMembers, pathname, searchParamsKey]);

  useEffect(() => {
    const loadActiveBusiness = async () => {
      const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
      const json = (await res.json()) as { activeBusinessId?: string };
      setActiveBusinessId(json.activeBusinessId || null);
    };

    window.setTimeout(() => {
      void loadActiveBusiness();
    }, 0);
    const handleBusinessSwitched = () => {
      window.setTimeout(() => {
        void loadActiveBusiness();
        void loadManage();
        if (activeTab === "members") void loadMembers();
        if (activeTab === "invites") void loadInvites();
      }, 0);
    };

    window.addEventListener("merchant:business-switched", handleBusinessSwitched);
    return () => window.removeEventListener("merchant:business-switched", handleBusinessSwitched);
  }, [activeTab, businessId, loadInvites, loadManage, loadMembers]);

  const updateBusiness = async () => {
    if (!trimmedEditingName || !profileChanged || isSavingName) return;
    const nextName = trimmedEditingName;
    setIsSavingName(true);
    const toastId = toast.loading("Saving business name...");

    try {
      const res = await fetch(`/api/merchant/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string }; message?: string };

      if (!res.ok) {
        const message = json.error?.message || json.message || "Failed to save business name.";
        toast.error(message, { id: toastId });
        return;
      }

      await loadManage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("merchant:business-updated", { detail: { businessId, name: nextName } }));
      }
      toast.success("Business name updated.", { id: toastId });
    } catch {
      toast.error("Failed to save business name.", { id: toastId });
    } finally {
      setIsSavingName(false);
    }
  };

  const deactivateBusiness = async () => {
    if (isDeactivating) return;
    setIsDeactivating(true);
    const toastId = toast.loading("Deactivating business...");
    try {
      const res = await fetch(`/api/merchant/businesses/${businessId}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to deactivate business."), { id: toastId });
        return;
      }
      toast.success("Business deactivated.", { id: toastId });
      window.location.href = "/business";
    } catch {
      toast.error("Failed to deactivate business.", { id: toastId });
    } finally {
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const patchMember = async (memberId: string, payload: { role?: "OWNER" | "ADMIN" | "MEMBER"; isActive?: boolean }) => {
    if (isPatchingMember) return;
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
      await loadMembers();
    } catch {
      toast.error("Failed to update member.");
    } finally {
      setIsPatchingMember(false);
    }
  };

  const createInvite = async () => {
    if (isCreatingInvite) return;
    setIsCreatingInvite(true);
    const toastId = toast.loading("Generating invite code...");
    try {
      const res = await fetch("/api/merchant/businesses/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, role: inviteRole, expiresInHours: 72 }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { code?: string }; message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to create invite."), { id: toastId });
        return;
      }
      setLastCode(json.data?.code || "");
      await loadInvites();
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
        body: JSON.stringify({ code: joinCode.trim(), setActive: false }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to join business."), { id: toastId });
        return;
      }
      setJoinCode("");
      toast.success("Join request completed.", { id: toastId });
    } catch {
      toast.error("Failed to join business.", { id: toastId });
    } finally {
      setIsJoiningBusiness(false);
    }
  };

  const saveWebhook = async () => {
    if (isSavingWebhook) return;
    setIsSavingWebhook(true);
    const toastId = toast.loading("Saving webhook URL...");
    try {
      const res = await fetch("/api/merchant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, webhookUrl: webhookUrl.trim() }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (!res.ok) {
        toast.error(readApiMessage(json, "Failed to save webhook URL."), { id: toastId });
        return;
      }
      await loadManage();
      toast.success("Webhook URL saved.", { id: toastId });
    } catch {
      toast.error("Failed to save webhook URL.", { id: toastId });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const developerMerchant = useMemo(
    () => ({
      businessId,
      apiKey: ctx?.business.apiKey || null,
      webhookSecret: ctx?.business.webhookSecret || null,
      webhookUrl: ctx?.business.webhookUrl || null,
    }),
    [businessId, ctx?.business.apiKey, ctx?.business.webhookSecret, ctx?.business.webhookUrl],
  );

  if (!ctx) {
    return <div className="dashboard-card p-6 text-sm text-slate-500">Loading business context...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Manage: {ctx.business.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scoped settings for this business only ({ctx.business.code}).</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/business"
              className="dashboard-secondary px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              Back to Hub
            </Link>
            {activeBusinessId && activeBusinessId !== businessId ? (
              <Link
                href={`/business/manage/${activeBusinessId}`}
                className="dashboard-secondary px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              >
                Open Active Business
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 dashboard-card p-2 shadow-sm shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.045] md:grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${selected ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "entity" && (
      <div className="dashboard-card p-5">
        <p className="text-sm font-semibold">Business profile</p>
        <div className="mt-3 flex gap-2">
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 dashboard-muted-panel px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
            <button
              onClick={() => void updateBusiness()}
              disabled={!canManageBusiness || !trimmedEditingName || !profileChanged || isSavingName}
              className="dashboard-secondary px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              {isSavingName ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowDeactivateModal(true)}
              disabled={!isOwner}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="dashboard-card p-5">
          <div className="space-y-3">
            {members.map((row) => (
              <div key={row.id} className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{row.merchant.businessName}</p>
                    <p className="text-xs text-slate-500">{row.merchant.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={row.role} onChange={(e) => void patchMember(row.id, { role: e.target.value as "OWNER" | "ADMIN" | "MEMBER" })} disabled={!isOwner || isPatchingMember} className="dashboard-secondary px-2 py-1 text-xs text-slate-700 outline-none transition-colors focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                    <button onClick={() => void patchMember(row.id, { isActive: !row.isActive })} disabled={!isOwner || isPatchingMember} className="dashboard-secondary px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">{row.isActive ? "Deactivate" : "Activate"}</button>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-slate-500">No members found.</p>}
          </div>
        </div>
      )}

      {activeTab === "invites" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="dashboard-card p-5">
              <p className="text-sm font-semibold">Create invite code</p>
              <div className="mt-3 flex items-center gap-2">
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")} className="dashboard-secondary px-2 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button onClick={() => void createInvite()} disabled={!canManageBusiness || isCreatingInvite} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{isCreatingInvite ? "Generating..." : "Generate"}</button>
              </div>
              {lastCode && <p className="mt-3 rounded-lg bg-slate-50 p-2 font-mono text-xs dark:bg-white/[0.03]">{lastCode}</p>}
            </div>

            <div className="dashboard-card p-5">
              <p className="text-sm font-semibold">Join with invite code</p>
              <div className="mt-3 flex items-center gap-2">
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="BIZ-XXXXXX-XXXXXX-XXXXXX" className="flex-1 dashboard-muted-panel px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white" />
                <button onClick={() => void joinBusiness()} disabled={isJoiningBusiness || !joinCode.trim()} className="dashboard-secondary px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">{isJoiningBusiness ? "Joining..." : "Join"}</button>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-5">
            <p className="text-sm font-semibold">Recent invites</p>
            <div className="mt-3 space-y-2">
              {invites.map((item) => (
                <div key={item.id} className="dashboard-muted-panel px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="font-semibold">Role {item.role} • code ending {item.codeHint}</p>
                  <p className="text-slate-500">Expires: {new Date(item.expiresAt).toLocaleString()} • {item.usedAt ? "Used" : "Pending"}</p>
                </div>
              ))}
              {invites.length === 0 && <p className="text-sm text-slate-500">No invites yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "wallet" && <WalletOverview initialWallet={ctx.business.settlementWalletAddress || null} businessId={businessId} canManage={isOwner} />}

      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="dashboard-card p-5">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webhook endpoint</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://your-api.com/webhooks/trezalink" className="flex-1 dashboard-muted-panel px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white" />
              <button onClick={() => void saveWebhook()} disabled={!canManageBusiness || isSavingWebhook} className="dashboard-primary px-4 py-2 disabled:opacity-50">{isSavingWebhook ? "Saving..." : "Save URL"}</button>
            </div>
          </div>

          <DeveloperView merchant={developerMerchant} canManage={canManageBusiness} />
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto dashboard-card shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-white/[0.045] animate-in zoom-in-95 duration-200">
            <div className="relative p-6 pb-3 text-center">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X size={18} />
              </button>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Deactivate Business Entity</h3>
            </div>

            <div className="px-6 pb-6 text-center">
              <p className="break-words whitespace-normal text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                This will set the entity inactive, deactivate all memberships inside this business, and your active context may switch to another business or become empty.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
                className="order-2 w-full dashboard-secondary px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => void deactivateBusiness()}
                disabled={isDeactivating}
                className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:order-2"
              >
                {isDeactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
