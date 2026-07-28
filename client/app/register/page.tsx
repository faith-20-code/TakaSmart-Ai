"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/src/components/BrandMark";
import { getDashboardPath } from "@/src/components/ProtectedRoute";
import { useAuth, type UserType } from "@/src/context/AuthContext";
import { ApiError } from "@/src/lib/api";

const USER_TYPES: UserType[] = ["PERSONAL", "BUSINESS", "BUYER"];

const USER_TYPE_META: Record<UserType, { label: string; desc: string; icon: string }> = {
  PERSONAL: { label: "Personal", desc: "Post materials as an individual seller", icon: "🌿" },
  BUSINESS: { label: "Business", desc: "Manage collection points & EPR reports", icon: "🏭" },
  BUYER: { label: "Buyer", desc: "Source recyclable material from sellers", icon: "🔍" },
  ADMIN: { label: "Admin", desc: "Platform administration", icon: "⚙️" },
};

const inputClass = "mt-2 h-11 w-full rounded-lg border bg-[var(--ts-surface-alt)] px-4 text-sm outline-none transition placeholder:text-[var(--ts-muted)] focus:border-[var(--ts-green-600)] focus:bg-white";
const inputStyle = { borderColor: "var(--ts-border)", color: "var(--ts-ink)" };

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("PERSONAL");
  const [businessName, setBusinessName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isBusiness = userType === "BUSINESS";

  function handleUserTypeChange(type: UserType) {
    setUserType(type);
    if (type !== "BUSINESS") {
      setBusinessName("");
      setRegistrationNo("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register({
        name, phoneNumber, password, userType,
        ...(isBusiness ? { businessName, registrationNo } : {}),
      });
      const redirectPath =
        userType === "PERSONAL" ? "/dashboard/personal"
        : userType === "BUSINESS" ? "/dashboard/business"
        : getDashboardPath(user);
      router.push(redirectPath);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { error?: string; details?: { message: string }[] } | undefined;
        setError(data?.details?.[0]?.message || data?.error || "Could not create your account. Please try again.");
      } else {
        setError("Could not create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ts-bg)", fontFamily: "var(--ts-font-body)" }}>
      <div className="mx-auto grid min-h-screen max-w-6xl gap-0 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">

        {/* ── Left: value prop ── */}
        <div className="hidden lg:block">
          <BrandMark />
          <h1
            className="mt-8 text-4xl font-semibold leading-[1.1] tracking-[-0.02em]"
            style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}
          >
            Start with the right account for how you move materials.
          </h1>
          <p className="mt-4 text-base leading-7" style={{ color: "var(--ts-muted)" }}>
            Personal and business accounts post recyclable supply. Buyers discover relevant listings. All backed by AI pricing and EPR compliance tools.
          </p>
          <div className="mt-8 grid gap-3">
            {USER_TYPES.map((t) => {
              const m = USER_TYPE_META[t];
              return (
                <div
                  key={t}
                  className="flex items-start gap-3 rounded-xl border p-4"
                  style={{ borderColor: userType === t ? "var(--ts-green-100)" : "var(--ts-border)", background: userType === t ? "var(--ts-green-50)" : "var(--ts-surface)" }}
                >
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--ts-green-900)" }}>{m.label}</p>
                    <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--ts-muted)" }}>{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: form ── */}
        <section
          className="rounded-2xl border p-8 shadow-sm"
          style={{ background: "var(--ts-surface)", borderColor: "var(--ts-border)" }}
        >
          <div className="lg:hidden mb-6">
            <BrandMark />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--ts-green-900)", fontFamily: "var(--ts-font-display)" }}>
            Create account
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--ts-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--ts-green-600)" }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Full name</span>
              <input className={inputClass} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Phil Moyo" required />
            </label>
            <label className="block">
              <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Phone number</span>
              <input className={inputClass} style={inputStyle} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+254 712 345 678" required type="tel" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Password</span>
              <input className={inputClass} style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            {/* Account type selector */}
            <fieldset>
              <legend className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Account type</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {USER_TYPES.map((t) => {
                  const active = userType === t;
                  return (
                    <label
                      key={t}
                      className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center cursor-pointer transition"
                      style={{
                        borderColor: active ? "var(--ts-green-600)" : "var(--ts-border)",
                        background: active ? "var(--ts-green-50)" : "var(--ts-surface-alt)",
                      }}
                    >
                      <input className="sr-only" type="radio" name="userType" checked={active} onChange={() => handleUserTypeChange(t)} />
                      <span className="text-lg">{USER_TYPE_META[t].icon}</span>
                      <span className="text-xs font-semibold" style={{ color: active ? "var(--ts-green-700)" : "var(--ts-body)" }}>
                        {USER_TYPE_META[t].label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {isBusiness ? (
              <>
                <label className="block">
                  <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Business name</span>
                  <input className={inputClass} style={inputStyle} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold" style={{ color: "var(--ts-body)" }}>Registration number</span>
                  <input className={inputClass} style={inputStyle} value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} required />
                </label>
              </>
            ) : null}

            {error ? (
              <p className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--ts-red-bg)", color: "var(--ts-red)" }}>{error}</p>
            ) : null}

            <button
              className="h-11 w-full rounded-lg text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--ts-green-600)" }}
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
