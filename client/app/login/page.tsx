"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/src/components/BrandMark";
import { getDashboardPath } from "@/src/components/ProtectedRoute";
import { useAuth, type UserType } from "@/src/context/AuthContext";

const PREVIEW_TYPES: UserType[] = ["PERSONAL", "BUSINESS", "BUYER"];

const PREVIEW_LABELS: Record<UserType, string> = {
  PERSONAL: "Personal",
  BUSINESS: "Business",
  BUYER: "Buyer",
  ADMIN: "Admin",
};

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
      setError("Could not sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePreview(userType: UserType) {
    const user = previewAs(userType);
    router.push(getDashboardPath(user));
  }

  return (
    <main className="min-h-screen bg-[#f4f7f1] px-6 py-8 text-[#123526]">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="rounded-lg border border-[#d8e4dd] bg-white p-6 shadow-sm sm:p-8">
          <BrandMark />
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d9e75]">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#0b2318]">
              Sign in to TakaSmart
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5e7569]">
              Continue to your recycling marketplace dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold">Phone number</span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-[#bfd2c9] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#1d9e75] focus:bg-white"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+254712345678"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-[#bfd2c9] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#1d9e75] focus:bg-white"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              className="h-12 w-full rounded-md bg-[#1d9e75] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#177f60] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#5e7569]">
            New to TakaSmart?{" "}
            <Link className="font-semibold text-[#0b684d]" href="/register">
              Create an account
            </Link>
          </p>
        </section>

        <section className="rounded-lg border border-[#d8e4dd] bg-[#123526] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8d8c5]">
            Development preview
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Explore the role dashboards before backend auth is ready.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#c6ded4]">
            These shortcuts create a temporary in-memory user. They are only
            shown in development and do not create a real backend session.
          </p>
          {process.env.NODE_ENV === "development" ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {PREVIEW_TYPES.map((type) => (
                <button
                  className="h-12 rounded-md bg-white px-4 text-sm font-semibold text-[#123526] transition hover:bg-[#e8f3ec]"
                  key={type}
                  onClick={() => handlePreview(type)}
                  type="button"
                >
                  {PREVIEW_LABELS[type]}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-8 grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
            {["Cookie auth", "Role routing", "Sprint 1 stubs"].map((item) => (
              <div className="rounded-md bg-white/10 p-4" key={item}>
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}