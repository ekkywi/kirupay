"use client";

import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import type { FormEvent } from "react";
import { Activity, Bell, Building2, Check, CheckCheck, ChevronDown, Loader2, LogOut, Search, Settings, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotifications, type MerchantNotification } from "@/hooks/api/merchant/useNotifications";
import { createPortal } from "react-dom";
import { formatLocalDateTime } from "@/lib/local-time";
import { toast } from "sonner";

interface TopNavProps {
  merchant: {
    businessName?: string | null;
    displayName?: string | null;
    email?: string | null;
    activeBusinessId?: string | null;
    actorType: "merchant" | "internal";
  } | null;
}

type BusinessItem = {
  role: "OWNER" | "ADMIN" | "MEMBER";
  business: { id: string; name: string; code: string };
  isCurrent: boolean;
};

export function TopNav({ merchant }: TopNavProps) {
  const isAdmin = merchant?.actorType === "internal";
  const [isHydrated] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [switchingBusiness, setSwitchingBusiness] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 56, left: 0, width: 360 });
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const businessMenuRef = useRef<HTMLDivElement | null>(null);
  const businessMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTransactionSearch = pathname === "/payments" ? searchParams.get("search") || "" : "";
  const { items, unread, loading, hasMore, cursor, fetchNotifications, refreshUnread, markRead, markAllRead } = useNotifications({
    isPanelOpen: isNotificationOpen,
  });
  const iconControlBaseClass =
    "relative h-9 w-9 inline-flex items-center justify-center rounded-xl border transition-colors";
  const iconControlNeutralClass =
    `${iconControlBaseClass} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]`;
  const iconControlProfileClass =
    `${iconControlBaseClass} border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20`;
  const readApiMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") return fallback;
    const payload = body as { message?: string; error?: { message?: string } };
    return payload.error?.message || payload.message || fallback;
  };

  const loadBusinesses = useCallback(async () => {
    if (!merchant || merchant.actorType !== "merchant") return;

    try {
      const res = await fetch("/api/merchant/businesses", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { data?: BusinessItem[] };
      setBusinesses(json.data || []);
    } catch {
      // noop
    }
  }, [merchant]);

  const resolveNotificationLink = (item: MerchantNotification) => {
    if (item.source === "WEBHOOK") return "/business";
    return "/payments";
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBusinesses();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadBusinesses]);

  useEffect(() => {
    const handleBusinessEvent = () => {
      void loadBusinesses();
    };

    window.addEventListener("merchant:business-switched", handleBusinessEvent);
    window.addEventListener("merchant:business-updated", handleBusinessEvent);

    return () => {
      window.removeEventListener("merchant:business-switched", handleBusinessEvent);
      window.removeEventListener("merchant:business-updated", handleBusinessEvent);
    };
  }, [loadBusinesses]);

  const switchBusiness = async (businessId: string) => {
    if (!businessId || switchingBusiness) return;
    setSwitchingBusiness(true);
    const targetBusiness = businesses.find((item) => item.business.id === businessId);
    const toastId = toast.loading("Switching active business...");
    try {
      const res = await fetch("/api/merchant/businesses/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: { message?: string } };
      if (res.ok) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("merchant:business-switched", { detail: { businessId } }));
        }
        router.refresh();
        toast.success(`Active business switched to ${targetBusiness?.business.name || "selected business"}.`, { id: toastId });
      } else {
        toast.error(readApiMessage(json, "Failed to switch active business."), { id: toastId });
      }
    } catch {
      toast.error("Failed to switch active business.", { id: toastId });
    } finally {
      setSwitchingBusiness(false);
    }
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
    void fetchNotifications(undefined, { silent: true });
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
  const currentBusiness = businesses.find((item) => item.isCurrent) || (!businesses.length ? businesses.find((item) => item.business.id === merchant?.activeBusinessId) || null : null);
  const manageBusinessId = currentBusiness?.business.id || (businesses.length === 0 ? merchant?.activeBusinessId || null : null);
  const manageHref = manageBusinessId ? `/business/manage/${manageBusinessId}` : "/business";
  const manageDisabled = !isHydrated || !manageBusinessId;
  const switchDisabled = isHydrated ? switchingBusiness || businesses.length === 0 : undefined;
  const displayBusinessName = isHydrated ? currentBusiness?.business.name || "Select business" : merchant?.businessName || "Select business";
  const displayBusinessMeta = isHydrated
    ? currentBusiness?.role
      ? `${currentBusiness.role} · Active`
      : "No active business"
    : "Loading business context";

  useEffect(() => {
    if (!isBusinessMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = businessMenuRef.current;
      const trigger = businessMenuButtonRef.current;
      if (!panel || !trigger) return;
      if (panel.contains(target) || trigger.contains(target)) return;
      setIsBusinessMenuOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsBusinessMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isBusinessMenuOpen]);

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-emerald-900/10 bg-white/82 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#07110f]/90">
      <div className="flex items-center gap-4 min-w-0">
        <div className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
          T
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {merchant?.displayName || (isAdmin ? "Admin Console" : "Business Dashboard")}
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
        {!isAdmin && (
          <div className="relative hidden md:flex items-center gap-2">
            <button
              ref={businessMenuButtonRef}
              type="button"
              disabled={switchDisabled}
              onClick={() => {
                if (!isHydrated || switchingBusiness || businesses.length === 0) return;
                setIsProfileOpen(false);
                setIsNotificationOpen(false);
                setIsBusinessMenuOpen((value) => !value);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/10 bg-[#fbfaf5]/92 px-3 py-2 text-left shadow-sm shadow-emerald-950/5 backdrop-blur-2xl transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-[#07110f]/92 dark:shadow-black/20 dark:hover:bg-[#0b1815]/95"
            >
              <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              <div className="max-w-[220px] leading-tight">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {displayBusinessName}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {displayBusinessMeta}
                </p>
              </div>
              {switchingBusiness ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500 dark:text-slate-300" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              )}
            </button>
            <Link
              href={manageHref}
              aria-disabled={manageDisabled}
              onClick={(event) => {
                if (manageDisabled) {
                  event.preventDefault();
                }
              }}
              className={`rounded-xl border border-emerald-900/10 bg-[#fbfaf5]/92 px-3 py-2 text-[11px] font-semibold shadow-sm shadow-emerald-950/5 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-[#07110f]/92 dark:shadow-black/20 ${
                manageDisabled
                  ? "cursor-not-allowed text-slate-400 opacity-70 dark:text-slate-500"
                  : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-[#0b1815]/95"
              }`}
            >
              Manage
            </Link>

            {isBusinessMenuOpen && (
              <div
                ref={businessMenuRef}
                className="absolute left-0 top-[calc(100%+8px)] z-[80] w-[300px] rounded-2xl border border-emerald-900/10 bg-white/96 p-2 shadow-2xl shadow-emerald-950/15 ring-1 ring-emerald-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#07110f]/98 dark:shadow-black/40 dark:ring-emerald-400/10"
              >
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Switch business</p>
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {businesses.map((item) => {
                    const isActive = item.isCurrent;
                    return (
                      <button
                        key={item.business.id}
                        type="button"
                        onClick={() => {
                          if (isActive || switchingBusiness) return;
                          void switchBusiness(item.business.id);
                          setIsBusinessMenuOpen(false);
                        }}
                        disabled={switchingBusiness}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.business.name}</p>
                          <p className={`truncate text-[11px] ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}`}>
                            {item.role} · {isActive ? "Current" : item.business.code}
                          </p>
                        </div>
                        {isActive ? <Check className="h-4 w-4 shrink-0" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleTransactionSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={transactionSearch}
            onChange={(event) => setTransactionSearch(event.target.value)}
            placeholder="Search transactions..."
            className="w-64 dashboard-muted-panel py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
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
            className={iconControlNeutralClass}
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
            className={iconControlProfileClass}
            aria-label="Open account menu"
          >
            <User size={16} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 z-[80] mt-2 w-64 dashboard-card py-2 shadow-xl shadow-emerald-950/10 animate-in fade-in zoom-in duration-150 dark:bg-[#07110f]/95 dark:shadow-black/30">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isAdmin ? "Admin account" : "Business account"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white truncate">
                  {merchant?.email || "business@trezalink.com"}
                </p>
              </div>
              <Link
                href={isAdmin ? "/admin/overview" : "/settings"}
                onClick={() => setIsProfileOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]"
              >
                <Settings size={14} /> {isAdmin ? "Admin Home" : "Settings"}
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
              className="absolute dashboard-card py-2 shadow-xl shadow-emerald-950/10 dark:border-white/10 dark:bg-[#07110f]/95 dark:shadow-black/30"
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
                    <div key={item.id} className="relative border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={resolveNotificationLink(item)} onClick={() => setIsNotificationOpen(false)} className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                            {formatLocalDateTime(item.createdAt, { preset: "compact" })}
                          </p>
                        </Link>
                        {!item.readAt && (
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" aria-label="Unread notification" />
                            <button
                              onClick={() => void markRead(item.id)}
                              className="rounded-md px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                            >
                              Mark read
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {hasMore && cursor && (
                <div className="border-t border-slate-100 px-4 pt-2 dark:border-white/10">
                  <button
                    onClick={() => void fetchNotifications(cursor, { silent: true })}
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
