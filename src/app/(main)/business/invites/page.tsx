"use client";

import { useEffect, useState } from "react";
import { LinkIcon } from "lucide-react";

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

  const load = async () => {
    const res = await fetch("/api/merchant/businesses/invites", { cache: "no-store" });
    const json = (await res.json()) as { data?: InviteRow[] };
    setItems(json.data || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const createInvite = async () => {
    const res = await fetch("/api/merchant/businesses/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, expiresInHours: 72 }),
    });
    const json = (await res.json()) as { data?: { code?: string } };
    setLastCode(json.data?.code || "");
    await load();
  };

  const joinBusiness = async () => {
    if (!joinCode.trim()) return;
    await fetch("/api/merchant/businesses/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim(), setActive: true }),
    });
    setJoinCode("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          <LinkIcon className="h-4 w-4" />
          Business invites
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Generate and redeem invite codes</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create invite code</p>
          <div className="mt-3 flex items-center gap-2">
            <select value={role} onChange={(event) => setRole(event.target.value as "ADMIN" | "MEMBER")} className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]">
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button onClick={() => void createInvite()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Generate</button>
          </div>
          {lastCode && <p className="mt-3 rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700 dark:bg-white/[0.03] dark:text-slate-200">{lastCode}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Join with invite code</p>
          <div className="mt-3 flex items-center gap-2">
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="BIZ-XXXXXX-XXXXXX-XXXXXX" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0B0F17]" />
            <button onClick={() => void joinBusiness()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">Join</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent invites</p>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
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
