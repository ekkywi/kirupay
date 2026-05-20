"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocsNavItem } from "@/lib/docs-nav";
import { Menu, X } from "lucide-react";

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
    <div className="space-y-5">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{group}</p>
          <div className="mt-2 space-y-1">
            {items.map((item) => {
              const href = `/docs/${item.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  onClick={onNavigate}
                  className={`block rounded-lg px-3 py-2.5 transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p
                    className={`mt-0.5 text-xs leading-snug ${
                      active ? "text-blue-600/90 dark:text-blue-300/90" : "text-slate-500 dark:text-slate-400"
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
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Docs menu
        </button>
      </div>

      <aside className="docs-sidebar-card hidden lg:block lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3 py-2 text-xs text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
          Search coming soon
        </div>
        <NavList groups={groups} pathname={pathname} />
      </aside>

      {open && (
        <aside className="lg:hidden rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-white/10 dark:bg-[#0B0F17]">
          <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3 py-2 text-xs text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
            Search coming soon
          </div>
          <NavList groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>
      )}
    </>
  );
}
