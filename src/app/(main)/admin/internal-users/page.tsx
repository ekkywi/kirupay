import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Copy, Mail, ShieldCheck, UserRound, UserRoundCog, Users, XCircle } from "lucide-react";
import prisma from "@/lib/neon";
import { formatLocalDateTime } from "@/lib/local-time";
import { requireInternalUser } from "@/lib/auth-service";
import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { createInternalInviteAction } from "./actions";

type InternalUsersSearchParams = {
  success?: string;
  error?: string;
};

export const metadata: Metadata = {
  title: "Admin Internal Users",
};

function getInviteStatus(invite: { usedAt: Date | null; expiresAt: Date }) {
  if (invite.usedAt) return "USED";
  if (invite.expiresAt.getTime() < new Date().getTime()) return "EXPIRED";
  return "ACTIVE";
}

type InternalInviteRow = {
  id: string;
  email: string;
  role: string;
  usedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

type InternalUserInviteClient = {
  findMany: (args: {
    orderBy: { createdAt: "desc" };
    take: number;
    select: {
      id: true;
      email: true;
      role: true;
      expiresAt: true;
      usedAt: true;
      createdAt: true;
    };
  }) => Promise<InternalInviteRow[]>;
};

export default async function AdminInternalUsersPage({
  searchParams,
}: {
  searchParams: Promise<InternalUsersSearchParams>;
}) {
  const actor = await requireInternalUser();
  const now = new Date().getTime();
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams.success?.trim() || "";
  const error = resolvedSearchParams.error?.trim() || "";
  const isSuperadmin = actor.role === "SUPERADMIN";

  const [internalUsers, inviteRows] = await Promise.all([
    prisma.internalUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    ((prisma as unknown as { internalUserInvite?: InternalUserInviteClient }).internalUserInvite?.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
    }) ?? Promise.resolve([])),
  ]);

  const activeUsers = internalUsers.filter((user) => user.isActive).length;
  const inactiveUsers = internalUsers.length - activeUsers;
  const pendingInvites = inviteRows.filter((invite) => !invite.usedAt && invite.expiresAt.getTime() >= now).length;

  const inviteLink = success.startsWith("http") ? success : "";
  const statusMessage = inviteLink ? "Invite created successfully." : success;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldCheck className="h-4 w-4" />
            Team access management
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Internal users
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Internal access is invite-only. Manage team invitations and review current operator accounts.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/overview" className="dashboard-secondary">
            Admin overview
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AdminSurface>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminMetricCard icon={Users} label="Internal users" value={internalUsers.length.toString()} detail={`${activeUsers} active operators`} tone="blue" />
        <AdminMetricCard icon={CheckCircle2} label="Pending invites" value={pendingInvites.toString()} detail="Active invite tokens" tone="emerald" />
        <AdminMetricCard icon={XCircle} label="Inactive users" value={inactiveUsers.toString()} detail="Access currently disabled" tone="red" />
      </div>

      {error && (
        <AdminSurface className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <p className="text-sm font-semibold">{error}</p>
        </AdminSurface>
      )}

      {statusMessage && (
        <AdminSurface className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <p className="text-sm font-semibold">{statusMessage}</p>
        </AdminSurface>
      )}

      {inviteLink && (
        <AdminSurface>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Generated invite link</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="block min-w-0 flex-1 overflow-x-auto rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-white/[0.045] dark:text-emerald-200">
              {inviteLink}
            </code>
            <button
              type="button"
              onClick={undefined}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"
              disabled
              title="Copy manually from the field"
            >
              <Copy className="h-4 w-4" /> Copy manually
            </button>
          </div>
          <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-200/80">Share this link securely. It expires in 24 hours and can only be used once.</p>
        </AdminSurface>
      )}

      <AdminSurface padded={false}>
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader eyebrow="Invite flow" title="Create internal invite" description="Only SUPERADMIN can create new internal user invites." />
        </div>
        <div className="p-5">
          <form action={createInternalInviteAction} className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="team@trezalink.com"
                disabled={!isSuperadmin}
                className="w-full dashboard-muted-panel py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
              />
            </div>

            <select
              name="role"
              defaultValue="SUPPORT"
              disabled={!isSuperadmin}
              className="w-full dashboard-muted-panel px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
            >
              <option value="SUPPORT">SUPPORT</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>

            <button
              type="submit"
              disabled={!isSuperadmin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserRoundCog className="h-4 w-4" /> Send invite
            </button>
          </form>

          {!isSuperadmin && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">Your role is {actor.role}. Only SUPERADMIN can issue invites.</p>
          )}
        </div>
      </AdminSurface>

      <AdminSurface padded={false}>
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader eyebrow="Invite ledger" title="Pending and recent invites" description="Latest invite records with usage and expiry status." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="dashboard-table-head">
              <tr>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Expires</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {inviteRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No invites created yet.</td>
                </tr>
              ) : (
                inviteRows.map((invite) => {
                  const status = getInviteStatus(invite);
                  const statusClass =
                    status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : status === "USED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";

                  return (
                    <tr key={invite.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">{invite.email}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-900 dark:text-slate-100">{invite.role}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}>{status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatLocalDateTime(invite.expiresAt, { preset: "compact" })}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatLocalDateTime(invite.createdAt, { preset: "compact" })}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>

      <AdminSurface padded={false}>
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader eyebrow="Operator directory" title="Internal user accounts" description="Current internal accounts and access status." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="dashboard-table-head">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {internalUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No internal users found.</td>
                </tr>
              ) : (
                internalUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{user.name}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-900 dark:text-slate-100">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{formatLocalDateTime(user.createdAt, { preset: "compact" })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>
    </div>
  );
}
