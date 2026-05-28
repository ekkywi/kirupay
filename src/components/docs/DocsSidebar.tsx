"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocsNavItem } from "@/lib/docs-nav";
import { Command, Menu, Search, X } from "lucide-react";

type DocsSidebarProps = {
  nav: DocsNavItem[];
};

type GroupedDocs = ReturnType<typeof grouped>;

function grouped(nav: DocsNavItem[]) {
  return {
    "Getting Started": nav.filter((item) => item.group === "Getting Started"),
    Integrate: nav.filter((item) => item.group === "Integrate"),
    Operate: nav.filter((item) => item.group === "Operate"),
  };
}

function SearchPlaceholder() {
  return (
    <div className="mb-5 rounded-[1.15rem] border border-emerald-200/80 bg-emerald-50/70 px-3 py-3 text-xs text-emerald-800 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-200">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-black">
          <Search className="h-3.5 w-3.5" />
          Search coming soon
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white/60 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:border-emerald-300/15 dark:bg-white/[0.06] dark:text-emerald-200">
          <Command className="h-3 w-3" />K
        </span>
      </div>
    </div>
  );
}

function NavList({
  groups,
  pathname,
  onNavigate,
}: {
  groups: GroupedDocs;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{group}</p>
          <div className="mt-2 space-y-1.5">
            {items.map((item) => {
              const href = `/docs/${item.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  onClick={onNavigate}
                  className={`group relative block overflow-hidden rounded-[1rem] px-3.5 py-3 transition-all ${
                    active
                      ? "border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(209,250,229,0.88),rgba(207,250,254,0.58))] text-emerald-950 shadow-sm shadow-emerald-950/5 dark:border-emerald-300/15 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(34,211,238,0.09))] dark:text-emerald-100"
                      : "border border-transparent text-slate-700 hover:border-slate-200/80 hover:bg-white/66 hover:text-slate-950 dark:text-slate-200 dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  {active && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-cyan-300" />}
                  <p className="text-sm font-black tracking-tight">{item.title}</p>
                  <p
                    className={`mt-1 text-xs leading-snug ${
                      active ? "text-emerald-800/80 dark:text-emerald-100/75" : "text-slate-500 dark:text-slate-400"
                    }`}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DocsSidebar({ nav }: DocsSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = useMemo(() => grouped(nav), [nav]);

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/78 px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm shadow-slate-900/5 backdrop-blur-xl transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:text-emerald-200"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Docs menu
        </button>
      </div>

      <aside className="docs-sidebar-card hidden p-4 lg:sticky lg:top-28 lg:block lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <SearchPlaceholder />
        <NavList groups={groups} pathname={pathname} />
      </aside>

      {open && (
        <aside className="docs-mobile-menu p-4 lg:hidden">
          <SearchPlaceholder />
          <NavList groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>
      )}
    </>
  );
}
