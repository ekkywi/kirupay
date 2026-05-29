"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";
import { DashboardSelect } from "@/components/dashboard/DashboardSelect";

const EXPORT_STATUS_OPTIONS = ["ALL", "PAID", "PENDING", "FAILED"] as const;
type ExportStatus = (typeof EXPORT_STATUS_OPTIONS)[number];
const EXPORT_SOURCE_OPTIONS = ["ALL", "API", "PAYMENT_LINK"] as const;
type ExportSource = (typeof EXPORT_SOURCE_OPTIONS)[number];

function toDateInputValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toStartOfDayIso(dateInput: string) {
  return `${dateInput}T00:00:00.000Z`;
}

function toEndOfDayIso(dateInput: string) {
  return `${dateInput}T23:59:59.999Z`;
}

function buildExportUrl(input: {
  status: ExportStatus;
  source: ExportSource;
  currency: string;
  fromDate: string;
  toDate: string;
}) {
  const query = new URLSearchParams();

  query.set("status", input.status);
  query.set("source", input.source);
  query.set("currency", input.currency);
  query.set("from", toStartOfDayIso(input.fromDate));
  query.set("to", toEndOfDayIso(input.toDate));

  return `/api/merchant/transactions/export?${query.toString()}`;
}

function fallbackFilename() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${now.getUTCDate()}`.padStart(2, "0");
  return `transactions-reconciliation-${year}${month}${day}.csv`;
}

export function ExportTransactionsButton({ currencyOptions }: { currencyOptions: string[] }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ExportSource>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ExportStatus>("ALL");
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [dateError, setDateError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const defaultFromDate = useMemo(() => {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 30);
    return toDateInputValue(from);
  }, [today]);
  const defaultToDate = useMemo(() => toDateInputValue(today), [today]);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);

  const exportUrl = useMemo(
    () =>
      buildExportUrl({
        status: selectedStatus,
        source: selectedSource,
        currency: selectedCurrency,
        fromDate,
        toDate,
      }),
    [fromDate, selectedCurrency, selectedSource, selectedStatus, toDate],
  );
  const normalizedCurrencyOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(currencyOptions.filter((item) => item !== "ALL")))],
    [currencyOptions],
  );

  const onExport = async () => {
    if (!fromDate || !toDate) {
      setDateError("Please select both start and end date.");
      return;
    }
    if (fromDate > toDate) {
      setDateError("Start date cannot be later than end date.");
      return;
    }

    setDateError(null);
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
      setIsModalOpen(false);
    } catch {
      alert("Export failed: network error, please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative z-[121] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-900/10 bg-white/98 p-5 shadow-2xl shadow-blue-950/20 ring-1 ring-blue-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#080b1f]/98 dark:shadow-black/45 dark:ring-cyan-400/10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Export transactions</h3>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
            aria-label="Close export modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full dashboard-field px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full dashboard-field px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Status
            <DashboardSelect
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ExportStatus)}
              options={EXPORT_STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
              className="mt-1 block w-full px-3 py-2"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Source
            <DashboardSelect
              value={selectedSource}
              onValueChange={(value) => setSelectedSource(value as ExportSource)}
              options={EXPORT_SOURCE_OPTIONS.map((source) => ({ value: source, label: source }))}
              className="mt-1 block w-full px-3 py-2"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">
            Currency
            <DashboardSelect
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
              options={normalizedCurrencyOptions.map((currency) => ({ value: currency, label: currency }))}
              className="mt-1 block w-full px-3 py-2"
            />
          </label>
        </div>

        {dateError ? <p className="mt-3 text-xs text-red-600 dark:text-red-400">{dateError}</p> : null}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Maximum export range is 1 year.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 dashboard-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Download CSV"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={isExporting}
        className="dashboard-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      {isModalOpen && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
