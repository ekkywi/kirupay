"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, KeyRound, LinkIcon, Radio, Users, Wallet } from "lucide-react";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { DeveloperView } from "@/components/dashboard/developers/DeveloperView";

type TabId = "entities" | "members" | "invites" | "wallet" | "integrations";

type BusinessMembership = {
  membershipId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isCurrent: boolean;
    business: {
      id: string;
      name: string;
      code: string;
      contactEmail: string | null;
      settlementWalletAddress: string | null;
      apiKey?: string | null;
      webhookUrl?: string | null;
      webhookSecret?: string | null;
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
  { id: "entities", label: "Entities", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "invites", label: "Invites", icon: LinkIcon },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "integrations", label: "Integrations", icon: KeyRound },
];

export default function BusinessHubPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") || "entities") as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(tabs.some((t) => t.id === initialTab) ? initialTab : "entities");
  const [items, setItems] = useState<BusinessMembership[]>([]);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [lastCode, setLastCode] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const activeBusiness = useMemo(() => items.find((item) => item.isCurrent), [items]);

  const loadBusinesses = async () => {
    const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
    const json = (await res.json()) as { data?: BusinessMembership[] };
    const next = json.data || [];
    setItems(next);
    const active = next.find((item) => item.isCurrent);
    setEditingName(active?.business.name || "");
    setWebhookUrl(active?.business.webhookUrl || "");
  };

  const loadMembers = async () => {
    if (!activeBusiness) return;
    const res = await fetch(`/api/merchant/businesses/${activeBusiness.business.id}/members`, { cache: "no-store" });
    const json = (await res.json()) as { data?: MemberRow[] };
    setMembers(json.data || []);
  };

  const loadInvites = async () => {
    const res = await fetch("/api/merchant/businesses/invites", { cache: "no-store" });
    const json = (await res.json()) as { data?: InviteRow[] };
    setInvites(json.data || []);
  };

  useEffect(() => {
    void loadBusinesses();
  }, []);

  useEffect(() => {
    if (activeTab === "members") void loadMembers();
    if (activeTab === "invites") void loadInvites();
  }, [activeTab, activeBusiness?.business.id]);

  const updateTab = (tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/business?${params.toString()}`);
  };

  const createBusiness = async () => {
    if (!name.trim()) return;
    await fetch("/api/merchant/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), setActive: true }),
    });
    setName("");
    await loadBusinesses();
  };

  const switchBusiness = async (businessId: string) => {
    await fetch("/api/merchant/businesses/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    await loadBusinesses();
  };

  const updateBusiness = async () => {
    if (!activeBusiness || !editingName.trim()) return;
    await fetch(`/api/merchant/businesses/${activeBusiness.business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    await loadBusinesses();
  };

  const deleteBusiness = async () => {
    if (!activeBusiness) return;
    await fetch(`/api/merchant/businesses/${activeBusiness.business.id}`, { method: "DELETE" });
    await loadBusinesses();
  };

  const patchMember = async (memberId: string, payload: { role?: "OWNER" | "ADMIN" | "MEMBER"; isActive?: boolean }) => {
    if (!activeBusiness) return;
    await fetch(`/api/merchant/businesses/${activeBusiness.business.id}/members/${memberId}`, {
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
      body: JSON.stringify({ role: inviteRole, expiresInHours: 72 }),
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
      body: JSON.stringify({ code: joinCode.trim(), setActive: true }),
    });
    setJoinCode("");
    await loadBusinesses();
  };

  const saveWebhook = async () => {
    if (!webhookUrl.trim()) return;
    await fetch("/api/merchant/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
    });
    await loadBusinesses();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Business Hub</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage entity, members, invites, wallet, and integrations per business.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] md:grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => updateTab(tab.id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${selected ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "entities" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
            <p className="text-sm font-semibold">Create business</p>
            <div className="mt-3 flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]" />
              <button onClick={() => void createBusiness()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Create</button>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.membershipId} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B0F17]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{item.business.name}</p>
                    <p className="text-xs text-slate-500">{item.business.code} • {item.role}</p>
                  </div>
                  {item.isCurrent ? <span className="text-xs font-bold text-emerald-600">Active</span> : <button onClick={() => void switchBusiness(item.business.id)} className="rounded-lg border px-3 py-1 text-xs">Switch</button>}
                </div>
              </div>
            ))}
          </div>

          {activeBusiness && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
              <p className="text-sm font-semibold">Edit active business</p>
              <div className="mt-3 flex gap-2">
                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]" />
                <button onClick={() => void updateBusiness()} className="rounded-lg border px-3 py-2 text-sm">Save</button>
                <button onClick={() => void deleteBusiness()} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">Deactivate</button>
              </div>
            </div>
          )}
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
                    <select value={row.role} onChange={(e) => void patchMember(row.id, { role: e.target.value as "OWNER" | "ADMIN" | "MEMBER" })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-white/10 dark:bg-[#0B0F17]">
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                    <button onClick={() => void patchMember(row.id, { isActive: !row.isActive })} className="rounded-lg border px-2 py-1 text-xs">{row.isActive ? "Deactivate" : "Activate"}</button>
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
                <button onClick={() => void createInvite()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Generate</button>
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

      {activeTab === "wallet" && (
        <WalletOverview initialWallet={activeBusiness?.business.settlementWalletAddress || "pending"} />
      )}

      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webhook endpoint</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://your-api.com/webhooks/trezalink" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
              <button onClick={() => void saveWebhook()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save URL</button>
            </div>
          </div>

          <DeveloperView merchant={{ apiKey: activeBusiness?.business.apiKey || null, webhookSecret: activeBusiness?.business.webhookSecret || null, webhookUrl: activeBusiness?.business.webhookUrl || null }} />
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
        <p className="font-semibold">Role matrix</p>
        <p className="mt-1">OWNER can manage members/invites/business identity. ADMIN handles operations and invites. MEMBER has limited operational access.</p>
      </div>
    </div>
  );
}
