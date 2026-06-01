"use client";

import { BrandMark } from "@/src/components/BrandMark";

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  userName?: string;
  onLogout: () => void;
  children: React.ReactNode;
};

export function DashboardShell({
  eyebrow,
  title,
  description,
  userName,
  onLogout,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#f4f7f1] text-[#123526]">
      <header className="border-b border-[#d8e4dd] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <BrandMark />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-[#5e7569] sm:inline">
              {userName}
            </span>
            <button
              className="h-10 rounded-md border border-[#bfd2c9] bg-white px-4 text-sm font-semibold text-[#123526] transition hover:border-[#1d9e75] hover:text-[#0b684d]"
              onClick={onLogout}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d9e75]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#0b2318] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5e7569]">
              {description}
            </p>
          </div>
          <div className="rounded-lg border border-[#d8e4dd] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7c6a2b]">
              Today
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                ["0", "active"],
                ["0", "pending"],
                ["0", "messages"],
              ].map(([value, label]) => (
                <div className="rounded-md bg-[#f4f7f1] px-3 py-4" key={label}>
                  <p className="text-xl font-semibold text-[#0b2318]">{value}</p>
                  <p className="mt-1 text-xs font-medium text-[#5e7569]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
