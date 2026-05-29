"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, ExternalLink, Search, Filter, ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { formatLocalDateTime } from "@/lib/local-time";

interface LinkTableProps {
  links: PaymentLinkRow[];
  totalPages: number;
}

interface PaymentLinkRow {
  id: string;
  orderId: string;
  amount: number;
  feeAmount?: number | null;
  netAmount?: number | null;
  status: string;
  createdAt: Date | string;
}

export function LinkTable({ links, totalPages }: LinkTableProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // UBAH DI SINI: Ambil full router agar bisa menggunakan router.refresh() dan router.replace()
  const router = useRouter(); 

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  const [copiedId, setCopiedId] = useState<string | null>(null);
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

    router.replace(`${pathname}?${params.toString()}`); 
  }, [pathname, router, searchParams]);

  // --- TEMPATKAN FITUR SMART POLLING DI SINI ---
  useEffect(() => {
    // Cari tahu apakah ada minimal 1 transaksi berstatus PENDING di halaman tabel saat ini
    const hasPendingLinks = links.some((link) => link.status === "PENDING");

    // Jika tidak ada yang PENDING, jangan jalankan interval (Hemat resource!)
    if (!hasPendingLinks) return;

    // Jika ada yang PENDING, cek ke database via server setiap 5 detik
    const interval = setInterval(() => {
      router.refresh(); // Menarik data terbaru dari server secara gaib tanpa reload layar
    }, 5000);

    return () => clearInterval(interval); // Bersihkan memori saat komponen unmount/berubah
  }, [links, router]);

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateURL("search", debouncedSearch);
    }
  }, [currentSearch, debouncedSearch, updateURL]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSearchInput(currentSearch));
    return () => cancelAnimationFrame(frame);
  }, [currentSearch]);

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // ... SISA KODE JSX / HTML DI BAWAHNYA SAMA PERSIS SEPERTI SEBELUMNYA ...
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="dashboard-panel flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Reference ID..."
            className="dashboard-field block w-full py-2 pl-10 pr-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={currentStatus}
            onChange={(e) => updateURL("status", e.target.value)}
            className="dashboard-field block w-full cursor-pointer appearance-none py-2 pl-3 pr-8 text-sm font-semibold text-slate-700 dark:text-slate-300 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        {links.length === 0 ? (
           <div className="p-12 flex flex-col items-center justify-center text-center">
             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-400/10">
               <LinkIcon className="text-emerald-600/70 dark:text-emerald-300/70" size={24} />
             </div>
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No links found</h3>
             <p className="text-xs text-gray-500 max-w-sm">
               No payment links match the current filters. Create a new link or adjust your search.
             </p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="dashboard-table-head border-b border-blue-900/10 dark:border-white/10">
                <tr>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest rounded-tl-xl">Reference ID</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest">Gross</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest">Fee (0.3%)</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest">Net</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest">Status</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest">Created At</th>
                  <th className="p-4 font-black text-[10px] uppercase tracking-widest text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {link.orderId}
                    </td>
                    <td className="p-4 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                      {link.amount} SOL
                    </td>
                    <td className="p-4 text-xs font-mono font-medium text-red-500 dark:text-red-400">
                      {link.feeAmount ? `-${link.feeAmount} SOL` : '-'}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {link.netAmount ? `${link.netAmount} SOL` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${
                        link.status === "PAID" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                        link.status === "FAILED" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-[11px] font-medium">
                      {formatLocalDateTime(link.createdAt)}
                    </td>
                    <td className="p-4 flex justify-end gap-1">
                      <button
                        onClick={() => handleCopy(link.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === link.id ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                      </button>
                      <Link
                        href={`/pay/${link.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        title="Open Link in New Tab"
                      >
                        <ExternalLink size={16}/>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="dashboard-panel flex items-center justify-between px-4 py-3">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateURL("page", (currentPage - 1).toString())}
              disabled={currentPage <= 1}
              className="rounded-lg border border-blue-900/10 bg-white/60 p-2 text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.07]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => updateURL("page", (currentPage + 1).toString())}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-blue-900/10 bg-white/60 p-2 text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.07]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
