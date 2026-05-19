"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, ExternalLink, Search, Filter, ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

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
      
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#0B0F17] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shadow-slate-200/60 dark:shadow-none">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Reference ID..."
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
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B0F17] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm shadow-slate-200/60 dark:shadow-none">
        {links.length === 0 ? (
           <div className="p-12 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-50 dark:bg-white/[0.03] rounded-full flex items-center justify-center mb-4">
               <LinkIcon className="text-gray-400" size={24} />
             </div>
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No links found</h3>
             <p className="text-xs text-gray-500 max-w-sm">
               No payment links match the current filters. Create a new link or adjust your search.
             </p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
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
                    <td className="p-4 text-xs font-mono font-bold text-green-600 dark:text-green-500">
                      {link.netAmount ? `${link.netAmount} SOL` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${
                        link.status === "PAID" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                        link.status === "FAILED" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-[11px] font-medium">
                      {new Date(link.createdAt).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4 flex justify-end gap-1">
                      <button
                        onClick={() => handleCopy(link.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === link.id ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
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
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none">
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
