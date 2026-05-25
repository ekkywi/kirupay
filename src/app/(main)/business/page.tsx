"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, CirclePlus, Settings2, ShieldCheck } from "lucide-react";

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

export default function BusinessHubLandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [items, setItems] = useState<BusinessMembership[]>([]);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadBusinesses = useCallback(async () => {
    const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
    const json = (await res.json()) as { data?: BusinessMembership[] };
    setItems(json.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBusinesses();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadBusinesses, pathname, searchParamsKey]);

  useEffect(() => {
    const handleBusinessSwitched = () => {
      window.setTimeout(() => {
        void loadBusinesses();
      }, 0);
    };

    window.addEventListener("merchant:business-switched", handleBusinessSwitched);
    return () => window.removeEventListener("merchant:business-switched", handleBusinessSwitched);
  }, [loadBusinesses]);

  const createBusiness = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/merchant/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), setActive: false }),
      });
      const json = (await res.json()) as { data?: { business?: { id?: string } } };
      const createdBusinessId = json.data?.business?.id;
      setName("");
      if (res.ok && createdBusinessId) {
        await fetch("/api/merchant/businesses/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: createdBusinessId }),
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("merchant:business-switched", { detail: { businessId: createdBusinessId } }));
        }
        router.refresh();
        router.push(`/business/manage/${createdBusinessId}`);
        return;
      }
      await loadBusinesses();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Business Hub</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create entity quickly, then open a dedicated manage page per business.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          <CirclePlus className="h-4 w-4" />
          Quick create entity
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Business name"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]"
          />
          <button
            onClick={() => void createBusiness()}
            disabled={isSaving || !name.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          <Building2 className="h-4 w-4" />
          Business list
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.membershipId} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.business.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.business.code} • {item.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Active Context
                    </span>
                  )}
                  <Link
                    href={`/business/manage/${item.business.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No business memberships yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Credentials are isolated per business and only loaded inside each business manage page.</p>
        </div>
      </div>
    </div>
  );
}
