"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Eye, EyeOff, Info, Key, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { useCredentialsManager } from "@/hooks/api/merchant/useCredentialsManager";
import type { DeveloperMerchant } from "./DeveloperView";

type SecretFieldProps = {
  label: string;
  description: string;
  value: string;
  isVisible: boolean;
  isLoading: boolean;
  icon: typeof Key;
  actionLabel: string;
  loadingLabel: string;
  actionTone: "red" | "amber";
  canManage: boolean;
  onToggleVisibility: () => void;
  onCopy: () => void;
  onRoll: () => void;
};

function SecretField({
  label,
  description,
  value,
  isVisible,
  isLoading,
  icon: Icon,
  actionLabel,
  loadingLabel,
  actionTone,
  canManage,
  onToggleVisibility,
  onCopy,
  onRoll,
}: SecretFieldProps) {
  const rollClasses =
    actionTone === "red"
      ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
      : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/15";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type={isVisible ? "text" : "password"}
            value={value}
            readOnly
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-slate-800 outline-none dark:text-slate-200"
          />
          <button
            type="button"
            onClick={onToggleVisibility}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-600 dark:hover:bg-white/[0.08] dark:hover:text-blue-300"
            aria-label={isVisible ? "Hide secret" : "Show secret"}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:w-[260px]">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            type="button"
            onClick={onRoll}
            disabled={isLoading || !canManage}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${rollClasses}`}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? loadingLabel : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  tone,
  isLoading,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "red" | "amber";
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const Icon = tone === "red" ? AlertTriangle : ShieldCheck;
  const toneClasses = tone === "red" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700";
  const iconClasses = tone === "red" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300";

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#0B0F17]">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${toneClasses}`}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabCredentials({ merchant, canManage = true }: { merchant: DeveloperMerchant; canManage?: boolean }) {
  const [showKey, setShowKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showKeyConfirmModal, setShowKeyConfirmModal] = useState(false);
  const [showWebhookConfirmModal, setShowWebhookConfirmModal] = useState(false);

  const { currentKey, currentWebhookSecret, isRollingKey, isRollingWebhook, toast, handleCopy, executeRollKey, executeRollWebhookSecret } =
    useCredentialsManager(merchant.apiKey, merchant.webhookSecret, merchant.businessId ?? undefined);

  const onConfirmRollKey = async () => {
    const success = await executeRollKey();
    if (success) setShowKeyConfirmModal(false);
  };

  const onConfirmRollSecret = async () => {
    const success = await executeRollWebhookSecret();
    if (success) setShowWebhookConfirmModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {toast && (
        <div className={`fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 dark:bg-[#0B0F17] ${toast.type === "success" ? "border-emerald-200 dark:border-emerald-500/20" : "border-red-200 dark:border-red-500/20"}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toast.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-red-50 text-red-600 dark:bg-red-500/10"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{toast.message}</p>
        </div>
      )}

      {showKeyConfirmModal && canManage && (
        <ConfirmModal
          title="Roll production API key"
          description="Your current key will be invalid immediately. Update backend environment variables before sending new checkout requests."
          confirmLabel="Roll key"
          tone="red"
          isLoading={isRollingKey}
          onCancel={() => setShowKeyConfirmModal(false)}
          onConfirm={() => void onConfirmRollKey()}
        />
      )}

      {showWebhookConfirmModal && canManage && (
        <ConfirmModal
          title="Roll webhook secret"
          description="Existing webhook signature validation will fail until your receiving server is updated with the new secret."
          confirmLabel="Roll secret"
          tone="amber"
          isLoading={isRollingWebhook}
          onCancel={() => setShowWebhookConfirmModal(false)}
          onConfirm={() => void onConfirmRollSecret()}
        />
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Production security area</h4>
            <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-blue-200">
              Store credentials only on your backend. Regenerated keys take effect immediately across checkout creation and webhook verification.
            </p>
          </div>
        </div>
      </div>

      <SecretField
        label="Production API key"
        description="Authenticates server-to-server checkout creation requests."
        value={currentKey}
        isVisible={showKey}
        isLoading={isRollingKey}
        icon={Key}
        actionLabel="Roll key"
        loadingLabel="Rolling"
        actionTone="red"
        canManage={canManage}
        onToggleVisibility={() => setShowKey((value) => !value)}
        onCopy={() => handleCopy(currentKey, "API Key")}
        onRoll={() => {
          if (!canManage) return;
          setShowKeyConfirmModal(true);
        }}
      />

      <SecretField
        label="Webhook signing secret"
        description="Verifies X-Trezalink-Signature headers on delivered webhook events."
        value={currentWebhookSecret}
        isVisible={showWebhookSecret}
        isLoading={isRollingWebhook}
        icon={ShieldCheck}
        actionLabel="Roll secret"
        loadingLabel="Rolling"
        actionTone="amber"
        canManage={canManage}
        onToggleVisibility={() => setShowWebhookSecret((value) => !value)}
        onCopy={() => handleCopy(currentWebhookSecret, "Webhook Secret")}
        onRoll={() => {
          if (!canManage) return;
          setShowWebhookConfirmModal(true);
        }}
      />
    </div>
  );
}
