"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, PlusCircle } from "lucide-react";

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
  };
};

export default function BusinessEntitiesPage() {
  const [items, setItems] = useState<BusinessMembership[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
      const json = (await res.json()) as { data?: BusinessMembership[] };
      setItems(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createBusiness = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/merchant/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), setActive: true }),
      });
      setName("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const switchBusiness = async (businessId: string) => {
    await fetch("/api/merchant/businesses/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          <Building2 className="h-4 w-4" />
          Business entities
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Manage businesses</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create new business entity or switch active operating context.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create business</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Business name"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]"
          />
          <button
            onClick={() => void createBusiness()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Your memberships</p>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.membershipId} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.business.name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.business.code} • {item.role}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">Wallet: {item.business.settlementWalletAddress || "pending"}</p>
                  </div>
                  {item.isCurrent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => void switchBusiness(item.business.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No business memberships yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
