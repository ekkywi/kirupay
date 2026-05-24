// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Settings, 
  LinkIcon, 
  BarChart3,
  Building2,
  UserCog,
  Users,
  Wrench,
  Landmark,
  Globe,
  ChevronRight
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

export function Sidebar({ actorType }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = actorType === "internal";

  const merchantMenuCategories: MenuCategory[] = [
    {
      title: "OVERVIEW",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16}/> },
        { href: "/analytics", label: "Analytics", icon: <BarChart3 size={16}/> },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { href: "/payments", label: "Transactions", icon: <Activity size={16}/> },
        { href: "/payment-links", label: "Payment Links", icon: <LinkIcon size={16}/> },
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { href: "/settings", label: "Settings", icon: <Settings size={16}/> },
      ]
    },
    {
      title: "BUSINESS",
      items: [
        { href: "/business", label: "Business Hub", icon: <Building2 size={16}/> },
      ]
    }
  ];

  const adminMenuCategories: MenuCategory[] = [{
    title: "ADMINISTRATION",
    items: [
      { href: "/admin/overview", label: "Overview", icon: <LayoutDashboard size={16}/> },
      { href: "/admin/revenue", label: "Revenue & Treasury", icon: <Landmark size={16}/> },
      { href: "/admin/transactions", label: "Global Ledger", icon: <Globe size={16}/> },
      { href: "/admin/merchants", label: "Merchant List", icon: <UserCog size={16}/> },
      { href: "/admin/internal-users", label: "Internal Users", icon: <Users size={16}/> },
      {
        href: "/admin/maintenance",
        label: "Maintenance",
        icon: <Wrench size={16}/>,
        children: [
          { href: "/admin/maintenance", label: "Overview" },
          { href: "/admin/maintenance/control", label: "Control" },
          { href: "/admin/maintenance/rpc-health", label: "RPC Health" },
          { href: "/admin/maintenance/recovery", label: "Recovery" },
        ],
      },
    ]
  }];

  const menuCategories = isAdmin ? adminMenuCategories : merchantMenuCategories;

  const mobileItems = menuCategories.flatMap((category) => category.items).slice(0, 5);

  return (
    <>
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white/95 dark:border-white/10 dark:bg-[#0B0F17]/95 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-600/20">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="min-w-0">
            <span className="block font-bold text-sm tracking-tight text-slate-950 dark:text-white">Trezalink</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400">{isAdmin ? "Admin Console" : "Merchant OS"}</span>
          </div>
        </div>
      </div>
      
      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-5 space-y-6 px-3 custom-scrollbar">
        {menuCategories.map((category, index) => (
          <div key={index} className="space-y-1">
            {/* Category Title */}
            <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em] mb-2">
              {category.title}
            </h4>
            
            {/* Category Items */}
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const isMaintenanceParent = Boolean(item.children && pathname.startsWith("/admin/maintenance"));
                const isAdminRoute = item.href.startsWith("/admin");
                
                return (
                  <div key={item.href} className="space-y-1">
                    <Link
                      href={item.href}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? isAdminRoute
                            ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" 
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
                      }`}
                    >
                      <span className={isActive ? "" : "text-slate-400 group-hover:text-current"}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight size={14} />}
                    </Link>

                    {item.children && isMaintenanceParent && (
                      <div className="ml-6 space-y-0.5 border-l border-slate-200 pl-3 dark:border-white/10">
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
                                  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-100"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs font-semibold text-slate-950 dark:text-white">Production mode</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          SOL settlement, live API keys, and signed webhook delivery are active.
        </p>
      </div>
    </aside>
    <nav className="lg:hidden fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-[#0B0F17]/95 dark:shadow-black/30">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.04]"
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
