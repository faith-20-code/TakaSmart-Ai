"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/src/components/BrandMark";
import { getDashboardPath } from "@/src/components/ProtectedRoute";
import { useAuth, type UserType } from "@/src/context/AuthContext";

const PREVIEW_TYPES: UserType[] = ["PERSONAL", "BUSINESS", "BUYER"];

const PREVIEW_META: Record<UserType, { label: string; desc: string; color: string }> = {
  PERSONAL: { label: "Personal seller", desc: "Post batches, earn points, redeem vouchers", color: "var(--ts-green-600)" },
  BUSINESS: { label: "Business", desc: "Log drop-offs, view EPR reports, manage collection points", color: "var(--ts-teal)" },
  BUYER: { label: "Buyer", desc: "Browse supply, express interest, contact sellers", color: "var(--ts-amber)" },
  ADMIN: { label: "Admin", desc: "Platform administration", color: "var(--ts-muted)" },
};

const inputClass = "mt-2 h-11 w-full rounded-lg border bg-[var(--ts-surface-alt)] px-4 text-sm outline-none transition placeholder:text-[var(--ts-muted)] focus:border-[var(--ts-green-600)] focus:bg-white";
const inputStyle = { borderColor: "var(--ts-border)", color: "var(--ts-ink)" };

export default function LoginPage() {
  const router = useRouter();
  const { login, previewAs } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ phoneNumber, password });
      router.push(getDashboardPath(user));
    } catch {
      setError("Could not sign you in. Check your phone number and password.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePreview(userType: UserType) {
    const user = previewAs(userType);
    router.push(getDashboardPath(user));
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ts-bg)", fontFamily: "var(--ts-font-body)" }}>
      <div className="mx-auto grid min-h-screen max-w-6xl gap-0 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">

        {/* ── Left: Login form ── */}
        <section
          className="w-full rounded-2xl border p-8 shadow-sm"
          style={{ background: "var(--ts-surface)", borderColor: "var(--ts-border)" }}
        >
          <BrandMark />

          <div className="mt-8">
            <h1 className="text-2xl font-semibold" style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}>
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--ts-muted)" }}>
              Sign in to your TakaSmart account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Phone number</span>
              <input
                className={inputClass}
                style={inputStyle}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254 712 345 678"
                required
                type="tel"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Password</span>
              <input
                className={inputClass}
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error ? (
              <p className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--ts-red-bg)", color: "var(--ts-red)" }}>
                {error}
              </p>
            ) : null}

            <button
              className="mt-2 h-11 w-full rounded-lg text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--ts-green-600)" }}
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm" style={{ color: "var(--ts-muted)" }}>
            New to TakaSmart?{" "}
            <Link className="font-semibold" href="/register" style={{ color: "var(--ts-green-600)" }}>
              Create an account
            </Link>
          </p>
        </section>

        {/* ── Right: Dev preview panel ── */}
        <section className="rounded-2xl p-8" style={{ background: "var(--ts-green-800)" }}>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(168,216,197,0.7)", fontFamily: "var(--ts-font-mono)" }}
          >
            Preview mode
          </p>
          <h2
            className="mt-2 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--ts-font-display)" }}
          >
            Explore without an account
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "rgba(198,222,212,0.8)" }}>
            Click a role below to load a preview session. No backend auth
            required — ideal for reviewing dashboard changes.
          </p>

          <div className="mt-6 grid gap-3">
            {PREVIEW_TYPES.map((type) => {
              const m = PREVIEW_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePreview(type)}
                  className="group flex w-full items-center gap-4 rounded-xl p-4 text-left transition"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {type[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{m.label}</p>
                    <p className="mt-0.5 text-[11px] leading-4" style={{ color: "rgba(198,222,212,0.7)" }}>{m.desc}</p>
                  </div>
                  <svg className="ml-auto shrink-0 opacity-40 group-hover:opacity-80 transition" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div
            className="mt-6 rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-[11px] leading-5" style={{ color: "rgba(168,216,197,0.6)", fontFamily: "var(--ts-font-mono)" }}>
              Preview sessions are in-memory only and do not create real backend sessions. API calls requiring auth will show empty or loading states.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
