"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import type { FormEvent } from "react";
import { Activity, Bell, CheckCheck, LogOut, Search, Settings, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotifications, type MerchantNotification } from "@/hooks/api/merchant/useNotifications";
import { createPortal } from "react-dom";
import { formatLocalDateTime } from "@/lib/local-time";

interface TopNavProps {
  merchant: {
    businessName?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function TopNav({ merchant }: TopNavProps) {
  const isAdmin = merchant?.role === "ADMIN";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [notificationPosition, setNotificationPosition] = useState({ top: 56, left: 0, width: 360 });
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTransactionSearch = pathname === "/payments" ? searchParams.get("search") || "" : "";
  const { items, unread, loading, hasMore, cursor, fetchNotifications, refreshUnread, markRead, markAllRead } = useNotifications();

  const resolveNotificationLink = (item: MerchantNotification) => {
    if (item.source === "WEBHOOK") return "/developers";
    return "/payments";
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTransactionSearch(currentTransactionSearch));
    return () => cancelAnimationFrame(frame);
  }, [currentTransactionSearch]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const updatePosition = () => {
      const button = notificationButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const preferredWidth = Math.min(360, viewportWidth - 16);
      const rightAlignedLeft = rect.right - preferredWidth;
      const clampedLeft = Math.max(8, Math.min(rightAlignedLeft, viewportWidth - preferredWidth - 8));

      setNotificationPosition({
        top: rect.bottom + 8,
        left: clampedLeft,
        width: preferredWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!isNotificationOpen) return;
    void refreshUnread();
    void fetchNotifications();
  }, [fetchNotifications, isNotificationOpen, refreshUnread]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = notificationPanelRef.current;
      const button = notificationButtonRef.current;

      if (!panel || !button) return;
      if (panel.contains(target) || button.contains(target)) return;
      setIsNotificationOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isNotificationOpen]);

  const handleTransactionSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const search = transactionSearch.trim();
    const params = new URLSearchParams(pathname === "/payments" ? searchParams : undefined);

    params.delete("page");

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.push(query ? `/payments?${query}` : "/payments");
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0B0F17]/95 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 min-w-0">
        <div className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
          T
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {merchant?.businessName || (isAdmin ? "Admin console" : "Merchant dashboard")}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">Network</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Solana operational
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleTransactionSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={transactionSearch}
            onChange={(event) => setTransactionSearch(event.target.value)}
            placeholder="Search transactions..."
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
          />
        </form>
        
        <ThemeToggle />

        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={() => {
              void refreshUnread();
              setIsProfileOpen(false);
              setIsNotificationOpen((value) => !value);
            }}
            className="relative h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]"
            aria-label="Open notifications"
          >
            <Bell size={16} className="mx-auto" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

        </div>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(false);
              setIsProfileOpen((value) => !value);
            }}
            className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20"
            aria-label="Open account menu"
          >
            <User size={16} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isAdmin ? "Admin account" : "Merchant account"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white truncate">
                  {merchant?.email || "merchant@trezalink.com"}
                </p>
              </div>
              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]"
              >
                <Settings size={14} /> Settings
              </Link>
              <div className="mx-4 my-1 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                <Activity size={14} className="text-emerald-500" />
                {isAdmin ? "Live admin environment" : "Live merchant environment"}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {typeof document !== "undefined" && isNotificationOpen &&
        createPortal(
          <div className="fixed inset-0 z-[90]">
            <div className="absolute inset-0 bg-transparent" />
            <div
              ref={notificationPanelRef}
              className="absolute rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-black/30"
              style={{
                top: notificationPosition.top,
                left: notificationPosition.left,
                width: notificationPosition.width,
                maxWidth: "calc(100vw - 16px)",
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 pb-2 pt-1 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notifications</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{unread} unread</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Local time</p>
                </div>
                <button
                  onClick={() => void markAllRead()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  <CheckCheck size={13} /> Mark all
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {loading && items.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">Loading notifications...</p>
                ) : items.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={resolveNotificationLink(item)} onClick={() => setIsNotificationOpen(false)} className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                            {formatLocalDateTime(item.createdAt, { preset: "compact" })}
                          </p>
                        </Link>
                        {!item.readAt && (
                          <button
                            onClick={() => void markRead(item.id)}
                            className="rounded-md px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {hasMore && cursor && (
                <div className="border-t border-slate-100 px-4 pt-2 dark:border-white/10">
                  <button
                    onClick={() => void fetchNotifications(cursor)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
