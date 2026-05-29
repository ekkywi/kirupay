"use client";

import { useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, Globe, LockKeyhole, Mail, Save, Store, Wallet } from "lucide-react";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { useMerchantUpdate } from "@/hooks/api/merchant/useMerchantUpdate";
import { useNotificationPreferences } from "@/hooks/api/merchant/useNotificationPreferences";
import { formatLocalDateTime } from "@/lib/local-time";

type SettingsTab = "profile" | "payouts" | "webhooks";

type SettingsMerchant = {
  businessName: string;
  email: string;
  walletAddress: string;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date | string;
};

const tabs: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof Store;
}> = [
  {
    id: "profile",
    label: "Store Profile",
    description: "Checkout identity",
    icon: Store,
  },
  {
    id: "payouts",
    label: "Payouts",
    description: "Settlement wallet",
    icon: Wallet,
  },
  {
    id: "webhooks",
    label: "Integrations",
    description: "Event delivery",
    icon: Globe,
  },
];

export function SettingsView({ merchant }: { merchant: SettingsMerchant }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [businessName, setBusinessName] = useState(merchant.businessName || "");
  const [webhookUrl, setWebhookUrl] = useState(merchant.webhookUrl || "");
  const { updateField, loading, status } = useMerchantUpdate();
  const { preferences, setPreferences, changed, save, loading: preferencesLoading } = useNotificationPreferences();

  const walletConnected = !merchant.walletAddress.includes("pending");
  const profileChanged = businessName.trim() !== merchant.businessName;
  const webhookChanged = webhookUrl.trim() !== (merchant.webhookUrl || "");

  const saveBusinessName = () => {
    void updateField("businessName", businessName.trim());
  };

  const saveWebhookUrl = () => {
    void updateField("webhookUrl", webhookUrl.trim());
  };

  const saveNotificationPreferences = async () => {
    await save();
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-panel grid grid-cols-1 gap-2 p-2 md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/15" : "bg-slate-100 dark:bg-white/[0.06]"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{tab.label}</span>
                <span className={`block text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}>{tab.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {status && (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          }`}
        >
          {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.msg}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="dashboard-card animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-slate-200 p-5 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Checkout identity</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Store profile</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                This information appears across hosted checkout and merchant-facing operational views.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="businessName" className="text-sm font-semibold text-slate-950 dark:text-white">
                  Business name
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Displayed to customers during payment confirmation.</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="businessName"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="min-w-0 flex-1 dashboard-muted-panel px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                  />
                  <button
                    type="button"
                    onClick={saveBusinessName}
                    disabled={loading || !businessName.trim() || !profileChanged}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:via-violet-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Account email</p>
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{merchant.email}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{merchant.emailVerified ? "Verified for account notifications." : "Verification is still pending."}</p>
                </div>

                <div className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <LockKeyhole className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Account status</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{merchant.isActive ? "Active" : "Paused"}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{merchant.isActive ? "Account can create live checkouts." : "Account is currently paused."}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Profile summary</p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Business", value: businessName || "Not configured" },
                { label: "Created", value: formatLocalDateTime(merchant.createdAt, { preset: "date" }) },
                { label: "Email status", value: merchant.emailVerified ? "Verified" : "Pending" },
                { label: "Environment", value: merchant.isActive ? "Live" : "Paused" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="max-w-[180px] truncate text-right text-sm font-semibold text-slate-950 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Wallet-signed payout protection</h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-200">
                    Settlement addresses are linked through Phantom wallet signing. Manual address entry is intentionally disabled for payment safety.
                  </p>
                </div>
              </div>
            </div>

            <WalletOverview initialWallet={merchant.walletAddress || "pending"} />
          </div>

          <div className="dashboard-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payout readiness</p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Wallet", value: walletConnected ? "Connected" : "Pending", ok: walletConnected },
                { label: "Checkout creation", value: walletConnected ? "Enabled" : "Blocked", ok: walletConnected },
                { label: "Settlement asset", value: "SOL", ok: true },
                { label: "Custody model", value: "Wallet-direct", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                    {item.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="dashboard-card animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-slate-200 p-5 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Event delivery</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Webhook configuration</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Receive payment confirmations from Trezalink and reconcile orders on your own backend.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="webhookUrl" className="text-sm font-semibold text-slate-950 dark:text-white">
                  Webhook endpoint URL
                </label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use an HTTPS endpoint that can accept signed payment events.</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="webhookUrl"
                    value={webhookUrl}
                    onChange={(event) => setWebhookUrl(event.target.value)}
                    placeholder="https://your-api.com/webhooks/trezalink"
                    className="min-w-0 flex-1 dashboard-muted-panel px-3 py-3 font-mono text-sm text-slate-950 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                  />
                  <button
                    type="button"
                    onClick={saveWebhookUrl}
                    disabled={loading || !webhookUrl.trim() || !webhookChanged}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:via-violet-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save endpoint"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="flex items-start gap-3">
                  <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950 dark:text-blue-100">Signed delivery</h4>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-200">
                      If this is your first endpoint, Trezalink will automatically generate a webhook signing secret when you save.
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notification preferences</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose which payment and webhook events appear in your in-app notification center.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "paymentSuccess", label: "Payment success", detail: "Notify when transactions are confirmed as paid." },
                    { key: "paymentFailed", label: "Payment failed", detail: "Notify when a transaction is marked failed." },
                    { key: "paymentPendingTooLong", label: "Payment pending too long", detail: "Notify when pending payments exceed safety threshold." },
                    { key: "webhookDeliveryFailed", label: "Webhook delivery failed", detail: "Notify when webhook response is timeout or non-2xx." },
                    { key: "webhookRecovered", label: "Webhook recovered", detail: "Notify when retry webhook delivery becomes successful." },
                  ].map((item) => {
                    const key = item.key as keyof typeof preferences;
                    return (
                      <label key={item.key} className="flex items-start justify-between gap-3 rounded-lg border border-blue-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.045]">
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={(event) =>
                            setPreferences((prev) => ({
                              ...prev,
                              [key]: event.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void saveNotificationPreferences()}
                    disabled={preferencesLoading || !changed}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:via-violet-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {preferencesLoading ? "Saving..." : "Save notification settings"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Integration status</p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Endpoint", value: merchant.webhookUrl ? "Configured" : "Not set", ok: Boolean(merchant.webhookUrl) },
                { label: "Signing secret", value: merchant.webhookSecret ? "Enabled" : "Pending", ok: Boolean(merchant.webhookSecret) },
                { label: "Delivery method", value: "POST JSON", ok: true },
                { label: "Event source", value: "Payment confirmation", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                    {item.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
