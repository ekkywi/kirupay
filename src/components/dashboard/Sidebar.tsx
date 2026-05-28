// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
  Code2,
  Globe,
  Landmark,
  LayoutDashboard,
  LinkIcon,
  Settings,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  actorType: "merchant" | "internal";
}

type MenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: Array<{
    href: string;
    label: string;
  }>;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

function isItemActive(pathname: string, item: MenuItem) {
  if (pathname === item.href) return true;
  if (item.href === "/dashboard") return false;
  if (item.href === "/business") return pathname.startsWith("/business");
  return pathname.startsWith(item.href);
}

export function Sidebar({ actorType }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = actorType === "internal";

  const merchantMenuCategories: MenuCategory[] = [
    {
      title: "MAIN",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { href: "/payment-links", label: "Payment Links", icon: <LinkIcon size={16} /> },
        { href: "/payments", label: "Payments", icon: <Activity size={16} /> },
      ],
    },
    {
      title: "INSIGHTS",
      items: [{ href: "/analytics", label: "Analytics", icon: <BarChart3 size={16} /> }],
    },
    {
      title: "BUSINESS",
      items: [{ href: "/business", label: "Business Hub", icon: <Building2 size={16} /> }],
    },
    {
      title: "DEVELOPER",
      items: [{ href: "/developers", label: "Developers", icon: <Code2 size={16} /> }],
    },
    {
      title: "SETTINGS",
      items: [{ href: "/settings", label: "Settings", icon: <Settings size={16} /> }],
    },
  ];

  const adminMenuCategories: MenuCategory[] = [
    {
      title: "COMMAND",
      items: [{ href: "/admin/overview", label: "Overview", icon: <LayoutDashboard size={16} /> }],
    },
    {
      title: "MONEY MOVEMENT",
      items: [
        { href: "/admin/transactions", label: "Global Ledger", icon: <Globe size={16} /> },
        { href: "/admin/revenue", label: "Revenue & Treasury", icon: <Landmark size={16} /> },
      ],
    },
    {
      title: "NETWORK",
      items: [
        { href: "/admin/merchants", label: "Merchant Accounts", icon: <UserCog size={16} /> },
        { href: "/admin/businesses", label: "Businesses", icon: <Building2 size={16} /> },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        {
          href: "/admin/maintenance",
          label: "Maintenance",
          icon: <Wrench size={16} />,
          children: [
            { href: "/admin/maintenance", label: "Overview" },
            { href: "/admin/maintenance/rpc-health", label: "RPC Health" },
            { href: "/admin/maintenance/recovery", label: "Recovery" },
            { href: "/admin/maintenance/control", label: "Control" },
          ],
        },
      ],
    },
    {
      title: "ACCESS",
      items: [{ href: "/admin/internal-users", label: "Internal Users", icon: <Users size={16} /> }],
    },
  ];

  const menuCategories = isAdmin ? adminMenuCategories : merchantMenuCategories;
  const mobileItems = menuCategories.flatMap((category) => category.items).slice(0, 5);

  return (
    <>
      <aside className="z-20 hidden w-72 shrink-0 flex-col border-r border-emerald-900/10 bg-[#f8f6ef]/95 shadow-sm shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#07110f]/95 lg:flex">
        <div className="flex h-16 items-center border-b border-emerald-900/10 px-5 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
              T
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold tracking-tight text-slate-950 dark:text-white">Trezalink</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-300/70">
                {isAdmin ? "Admin Console" : "Merchant OS"}
              </span>
            </div>
          </div>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {menuCategories.map((category) => (
            <div key={category.title} className="space-y-1">
              <h4 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {category.title}
              </h4>

              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = isItemActive(pathname, item);
                  const isMaintenanceParent = Boolean(item.children && pathname.startsWith("/admin/maintenance"));

                  return (
                    <div key={item.href} className="space-y-1">
                      <Link
                        href={item.href}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "border border-emerald-400/20 bg-gradient-to-r from-emerald-400/15 to-cyan-400/10 text-emerald-800 shadow-sm shadow-emerald-950/5 dark:text-emerald-200"
                            : "text-slate-500 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                        }`}
                      >
                        <span className={isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 group-hover:text-current"}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive ? <ChevronRight size={14} /> : null}
                      </Link>

                      {item.children && isMaintenanceParent ? (
                        <div className="ml-6 space-y-0.5 border-l border-emerald-400/20 pl-3">
                          {item.children.map((child) => {
                            const childIsActive =
                              pathname === child.href ||
                              (child.href !== "/admin/maintenance" && pathname.startsWith(child.href));

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`block rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                  childIsActive
                                    ? "bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"
                                    : "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-100"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-2xl border border-emerald-400/20 bg-white/65 p-4 shadow-sm shadow-emerald-950/5 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold text-slate-950 dark:text-white">Production mode</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            SOL settlement, live API keys, and signed webhook delivery are active.
          </p>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-emerald-400/20 bg-white/95 p-1.5 shadow-xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-[#07110f]/95 dark:shadow-black/30 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const isActive = isItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-400/15 text-emerald-800 dark:text-emerald-200"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                }`}
              >
                {item.icon}
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
