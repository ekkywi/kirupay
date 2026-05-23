"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { StatCard } from "./StatCard";
import { WalletOverview } from "./WalletOverview";
import { TransactionTable } from "./TransactionTable";
import { Activity, Globe, Save } from "lucide-react";
import type { Merchant, Transaction } from "@prisma/client";

type DashboardContentProps = {
  merchant: Pick<Merchant, "webhookUrl" | "walletAddress">;
  transactions: Transaction[];
  totalRevenue: number;
};

export function DashboardContent({ merchant, transactions, totalRevenue }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [webhookUrl, setWebhookUrl] = useState(merchant.webhookUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    await fetch("/api/merchant/update", {
      method: "POST",
      body: JSON.stringify({ webhookUrl }),
    });
    setSaving(false);
    alert("Settings updated!");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} actorType="merchant" />
      
      <main className="flex-1 overflow-y-auto p-8">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <StatCard 
                label="Total Revenue" 
                value={`${totalRevenue.toFixed(2)} SOL`} 
                icon={<Activity size={18} />} 
                trend="+100%" 
                trendUp={true} 
              />
              <WalletOverview initialWallet={merchant.walletAddress} />
            </div>
            <div className="lg:col-span-8">
              <TransactionTable transactions={transactions.slice(0, 5)} />
            </div>
          </div>
        )}

        {/* TAB: PAYMENTS (FULL LIST) */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white text-gray-800">All Transactions</h2>
            <TransactionTable transactions={transactions} />
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-800">Merchant Settings</h2>
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-6">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Webhook Notification URL</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#151515] rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                  <Globe size={18} className="text-gray-400" />
                  <input 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-site.com/api/webhook"
                    className="bg-transparent flex-1 outline-none text-sm font-mono dark:text-white"
                  />
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? "..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
