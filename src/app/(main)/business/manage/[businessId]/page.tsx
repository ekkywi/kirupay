"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, KeyRound, LinkIcon, Loader2, Users, Wallet, X } from "lucide-react";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { DeveloperView } from "@/components/dashboard/developers/DeveloperView";

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

  const role = ctx?.membership.role;
  const isOwner = role === "OWNER";
  const canManageBusiness = isOwner;

  const loadManage = async () => {
    const res = await fetch(`/api/merchant/businesses/${businessId}/manage`, { cache: "no-store" });
    const json = (await res.json()) as { data?: ManageContext };
    const next = json.data || null;
    setCtx(next);
    setEditingName(next?.business.name || "");
    setWebhookUrl(next?.business.webhookUrl || "");
  };

  const loadMembers = async () => {
    const res = await fetch(`/api/merchant/businesses/${businessId}/members`, { cache: "no-store" });
    const json = (await res.json()) as { data?: MemberRow[] };
    setMembers(json.data || []);
  };

  const loadInvites = async () => {
    const res = await fetch(`/api/merchant/businesses/invites?businessId=${encodeURIComponent(businessId)}`, { cache: "no-store" });
    const json = (await res.json()) as { data?: InviteRow[] };
    setInvites(json.data || []);
  };

  useEffect(() => {
    void loadManage();
  }, [businessId, pathname, searchParamsKey]);

  useEffect(() => {
    if (activeTab === "members") void loadMembers();
    if (activeTab === "invites") void loadInvites();
  }, [activeTab, businessId, pathname, searchParamsKey]);

  useEffect(() => {
    const loadActiveBusiness = async () => {
      const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
      const json = (await res.json()) as { activeBusinessId?: string };
      setActiveBusinessId(json.activeBusinessId || null);
    };

    void loadActiveBusiness();
    const handleBusinessSwitched = () => {
      void loadActiveBusiness();
      void loadManage();
      if (activeTab === "members") void loadMembers();
      if (activeTab === "invites") void loadInvites();
    };

    window.addEventListener("merchant:business-switched", handleBusinessSwitched);
    return () => window.removeEventListener("merchant:business-switched", handleBusinessSwitched);
  }, [activeTab, businessId]);

  const updateBusiness = async () => {
    if (!editingName.trim()) return;
    const nextName = editingName.trim();
    await fetch(`/api/merchant/businesses/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName }),
    });
    await loadManage();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("merchant:business-updated", { detail: { businessId, name: nextName } }));
    }
  };

  const deactivateBusiness = async () => {
    setIsDeactivating(true);
    try {
      await fetch(`/api/merchant/businesses/${businessId}`, { method: "DELETE" });
      window.location.href = "/business";
    } finally {
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const patchMember = async (memberId: string, payload: { role?: "OWNER" | "ADMIN" | "MEMBER"; isActive?: boolean }) => {
    await fetch(`/api/merchant/businesses/${businessId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadMembers();
  };

  const createInvite = async () => {
    const res = await fetch("/api/merchant/businesses/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, role: inviteRole, expiresInHours: 72 }),
    });
    const json = (await res.json()) as { data?: { code?: string } };
    setLastCode(json.data?.code || "");
    await loadInvites();
  };

  const joinBusiness = async () => {
    if (!joinCode.trim()) return;
    await fetch("/api/merchant/businesses/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim(), setActive: false }),
    });
    setJoinCode("");
  };

  const saveWebhook = async () => {
    await fetch("/api/merchant/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, webhookUrl: webhookUrl.trim() }),
    });
    await loadManage();
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
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-[#0B0F17]">Loading business context...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Manage: {ctx.business.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scoped settings for this business only ({ctx.business.code}).</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/business" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
              Back to Hub
            </Link>
            {activeBusinessId && activeBusinessId !== businessId ? (
              <Link href={`/business/manage/${activeBusinessId}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-blue-300 dark:hover:bg-blue-500/10">
                Open Active Business
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] md:grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${selected ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "entity" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
          <p className="text-sm font-semibold">Business profile</p>
          <div className="mt-3 flex gap-2">
            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]" />
            <button onClick={() => void updateBusiness()} disabled={!canManageBusiness} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Save</button>
            <button
              onClick={() => setShowDeactivateModal(true)}
              disabled={!isOwner}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
          <div className="space-y-3">
            {members.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{row.merchant.businessName}</p>
                    <p className="text-xs text-slate-500">{row.merchant.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={row.role} onChange={(e) => void patchMember(row.id, { role: e.target.value as "OWNER" | "ADMIN" | "MEMBER" })} disabled={!isOwner} className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-50 dark:border-white/10 dark:bg-[#0B0F17]">
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                    <button onClick={() => void patchMember(row.id, { isActive: !row.isActive })} disabled={!isOwner} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50">{row.isActive ? "Deactivate" : "Activate"}</button>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
              <p className="text-sm font-semibold">Create invite code</p>
              <div className="mt-3 flex items-center gap-2">
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")} className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]">
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button onClick={() => void createInvite()} disabled={!canManageBusiness} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Generate</button>
              </div>
              {lastCode && <p className="mt-3 rounded-lg bg-slate-50 p-2 font-mono text-xs dark:bg-white/[0.03]">{lastCode}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
              <p className="text-sm font-semibold">Join with invite code</p>
              <div className="mt-3 flex items-center gap-2">
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="BIZ-XXXXXX-XXXXXX-XXXXXX" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]" />
                <button onClick={() => void joinBusiness()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">Join</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
            <p className="text-sm font-semibold">Recent invites</p>
            <div className="mt-3 space-y-2">
              {invites.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webhook endpoint</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://your-api.com/webhooks/trezalink" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
              <button onClick={() => void saveWebhook()} disabled={!canManageBusiness} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Save URL</button>
            </div>
          </div>

          <DeveloperView merchant={developerMerchant} canManage={canManageBusiness} />
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#0B0F17] animate-in zoom-in-95 duration-200">
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
                className="order-2 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:order-1"
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
