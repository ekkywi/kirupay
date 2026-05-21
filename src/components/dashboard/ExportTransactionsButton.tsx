"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

function buildExportUrl(params: URLSearchParams) {
  const query = new URLSearchParams();
  const status = params.get("status") || "PAID";
  const from = params.get("from");
  const to = params.get("to");

  query.set("status", status);
  if (from) query.set("from", from);
  if (to) query.set("to", to);

  return `/api/merchant/transactions/export?${query.toString()}`;
}

function fallbackFilename() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${now.getUTCDate()}`.padStart(2, "0");
  return `transactions-reconciliation-${year}${month}${day}.csv`;
}

export function ExportTransactionsButton() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const exportUrl = useMemo(() => buildExportUrl(searchParams), [searchParams]);

  const onExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(exportUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        alert(`Export failed: ${toDiagnosticMessage(apiError)}`);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = /filename=\"?([^"]+)\"?/.exec(contentDisposition);
      const filename = filenameMatch?.[1] || fallbackFilename();

      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Export failed: network error, please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={isExporting}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </button>
  );
}
