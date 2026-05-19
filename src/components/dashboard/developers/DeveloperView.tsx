// src/components/dashboard/developers/DeveloperView.tsx
"use client";

import { useState } from "react";
import { Key, BookOpen, Activity } from "lucide-react";
import { TabCredentials } from "./TabCredentials";
import { TabApiDocs } from "./TabApiDocs";
import { TabWebhookLogs } from "./TabWebhookLogs";

export type DeveloperTab = "credentials" | "docs" | "logs";

export type DeveloperMerchant = {
  apiKey?: string | null;
  webhookSecret?: string | null;
  webhookUrl?: string | null;
};

const tabs: Array<{
  id: DeveloperTab;
  label: string;
  description: string;
  icon: typeof Key;
}> = [
  {
    id: "credentials",
    label: "Credentials",
    description: "Production keys",
    icon: Key,
  },
  {
    id: "docs",
    label: "API Reference",
    description: "Checkout schema",
    icon: BookOpen,
  },
  {
    id: "logs",
    label: "Webhook Logs",
    description: "Delivery history",
    icon: Activity,
  },
];

export function DeveloperView({ merchant }: { merchant: DeveloperMerchant }) {
  const [activeTab, setActiveTab] = useState<DeveloperTab>("credentials");

  return (
    <div className="relative space-y-6">
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
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

      {activeTab === "credentials" && <TabCredentials merchant={merchant} />}
      {activeTab === "docs" && <TabApiDocs />}
      {activeTab === "logs" && <TabWebhookLogs activeTab={activeTab} />}
    </div>
  );
}
