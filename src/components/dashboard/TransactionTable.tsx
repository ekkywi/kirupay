// src/components/dashboard/TransactionTable.tsx
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight, Activity, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface TransactionRow {
  id: string;
  orderId: string;
  customerReference?: string | null;
  amount: number;
  currency: string;
  feeAmount?: number | null;
  netAmount?: number | null;
  status: string;
  createdAt: Date | string;
  txSignature?: string | null;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
  totalPages?: number;
  showControls?: boolean;
}

export function TransactionTable({ transactions, totalPages = 1, showControls = true }: TransactionTableProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";
  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 500);

  const updateURL = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (key === "search" || key === "status") {
      params.set("page", "1");
    }

    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    replace(`${pathname}?${params.toString()}`);
  }, [pathname, replace, searchParams]);

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateURL("search", debouncedSearch);
    }
  }, [currentSearch, debouncedSearch, updateURL]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSearchInput(currentSearch));
    return () => cancelAnimationFrame(frame);
  }, [currentSearch]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* FILTER & SEARCH BAR */}
      {showControls && <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#0B0F17] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order or customer ref..."
            className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-blue-500 transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={currentStatus}
            onChange={(e) => updateURL("status", e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-8 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>}

      {/* TRANSACTION TABLE */}
      <div className={`${showControls ? "bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none" : "bg-transparent"} overflow-hidden`}>
        {transactions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Activity className="mb-3 opacity-20" size={48} />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/10">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-xl">Order ID</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee (0.3%)</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-tr-xl">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                    <td className="p-4">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{tx.orderId}</p>
                      <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        {tx.customerReference || "No customer ref"}
                      </p>
                    </td>
                    
                    {/* Gross */}
                    <td className="p-4 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                      {tx.amount} {tx.currency}
                    </td>
                    {/* Fee */}
                    <td className="p-4 text-xs font-mono font-medium text-red-500 dark:text-red-400">
                      {tx.feeAmount ? `-${tx.feeAmount} ${tx.currency}` : '-'}
                    </td>
                    {/* Net */}
                    <td className="p-4 text-xs font-mono font-bold text-green-600 dark:text-green-500">
                      {tx.netAmount ? `${tx.netAmount} ${tx.currency}` : '-'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        tx.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    
                    {/* Date */}
                    <td className="p-4 text-[11px] text-gray-500 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>

                    {/* Explorer Link (NEW) */}
                    <td className="p-4 text-right">
                      <a 
                        href={tx.txSignature ? `https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet` : '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex p-2 rounded-lg transition-all ${
                          tx.txSignature 
                            ? "text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100" 
                            : "text-gray-300 dark:text-[#2A2A2A] cursor-not-allowed opacity-50"
                        }`}
                        title={tx.txSignature ? "Verify on Solana Explorer" : "No blockchain record yet"}
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateURL("page", (currentPage - 1).toString())}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => updateURL("page", (currentPage + 1).toString())}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
