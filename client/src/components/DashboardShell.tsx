"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/src/components/BrandMark";

// ---------- nav items per user type ----------

type NavItem = { label: string; href: string; icon: React.ReactNode };

const iconClass = "w-[18px] h-[18px] shrink-0";

const icons = {
  overview: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  dropoff: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  collection: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" /><path d="M9 22V12h6v10" />
    </svg>
  ),
  epr: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  points: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
    </svg>
  ),
  marketplace: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
};

type DashboardShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  userName?: string;
  userType?: "PERSONAL" | "BUSINESS" | "BUYER" | "ADMIN";
  onLogout: () => void;
  children: React.ReactNode;
};

function getNavItems(userType?: string): NavItem[] {
  if (userType === "BUSINESS") {
    return [
      { label: "Overview", href: "/dashboard/business", icon: icons.overview },
      { label: "Log drop-off", href: "/dashboard/business?tab=log-dropoff", icon: icons.dropoff },
      { label: "Collection points", href: "/dashboard/business?tab=collection-points", icon: icons.collection },
      { label: "EPR reports", href: "/dashboard/business?tab=epr-reports", icon: icons.epr },
    ];
  }
  if (userType === "PERSONAL") {
    return [
      { label: "Overview", href: "/dashboard/personal", icon: icons.overview },
      { label: "My points", href: "/dashboard/personal#points", icon: icons.points },
      { label: "Collection points", href: "/dashboard/personal#collection-points", icon: icons.collection },
    ];
  }
  if (userType === "BUYER") {
    return [
      { label: "Marketplace", href: "/buyer", icon: icons.marketplace },
    ];
  }
  return [];
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={null}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

function DashboardShellInner({
  eyebrow,
  title,
  description,
  userName,
  userType,
  onLogout,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(userType);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--ts-green-700)" }}>
        <BrandMark href="/" dark />
      </div>

      {/* Nav */}
      {navItems.length > 0 ? (
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p
            className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--ts-font-mono)" }}
          >
            Navigation
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              // match on both pathname and query param so ?tab= links highlight correctly
              const itemTab = new URL(item.href, "http://x").searchParams.get("tab");
              const active = itemTab
                ? pathname === item.href.split("?")[0] && tabParam === itemTab
                : pathname === item.href.split("?")[0] && !tabParam;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                    style={{
                      color: active ? "white" : "rgba(255,255,255,0.65)",
                      background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex-1" />
      )}

      {/* User footer */}
      <div className="border-t p-4" style={{ borderColor: "var(--ts-green-700)" }}>
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--ts-green-600)", color: "white" }}
          >
            {userName?.[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: "white" }}>
              {userName ?? "User"}
            </p>
            <p
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--ts-font-mono)" }}
            >
              {userType?.toLowerCase() ?? "account"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="rounded-md p-1.5 transition"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ts-bg)" }}>

      {/* ── Sidebar (desktop) ── */}
      <aside
        className="hidden w-60 shrink-0 lg:flex lg:flex-col"
        style={{ background: "var(--ts-green-800)", position: "sticky", top: 0, height: "100vh" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-40 w-60 lg:hidden"
            style={{ background: "var(--ts-green-800)" }}
          >
            <SidebarContent />
          </aside>
        </>
      ) : null}

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 border-b px-6 py-3"
          style={{
            background: "var(--ts-surface)",
            borderColor: "var(--ts-border)",
          }}
        >
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="rounded-md p-1.5 lg:hidden"
            style={{ color: "var(--ts-muted)" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden">
            <BrandMark />
          </div>

          {/* Breadcrumb / page title */}
          <div className="hidden flex-1 lg:block">
            {eyebrow ? (
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--ts-green-600)", fontFamily: "var(--ts-font-mono)" }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="text-base font-semibold leading-tight"
              style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}
            >
              {title}
            </h1>
          </div>

          <div className="flex-1 lg:hidden" />

          {/* Right side: sign out (desktop only — sidebar handles mobile) */}
          <div className="hidden items-center gap-3 lg:flex">
            <span
              className="text-xs"
              style={{ color: "var(--ts-muted)", fontFamily: "var(--ts-font-mono)" }}
            >
              {userName}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:bg-[var(--ts-green-50)]"
              style={{ borderColor: "var(--ts-border)", color: "var(--ts-body)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </header>

        {/* Page header */}
        <div
          className="border-b px-6 py-6"
          style={{ background: "var(--ts-surface)", borderColor: "var(--ts-border)" }}
        >
          {eyebrow ? (
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em] lg:hidden"
              style={{ color: "var(--ts-green-600)", fontFamily: "var(--ts-font-mono)" }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="text-2xl font-semibold leading-tight lg:text-3xl"
            style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-1.5 max-w-2xl text-sm leading-6"
              style={{ color: "var(--ts-muted)" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="border-t px-6 py-4 text-xs"
          style={{
            borderColor: "var(--ts-border)",
            color: "var(--ts-muted)",
            fontFamily: "var(--ts-font-mono)",
          }}
        >
          TakaSmart AI · Nairobi Recycling Marketplace
        </footer>
      </div>
    </div>
  );
}
