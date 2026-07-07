"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/src/components/BrandMark";
import { dashboardByUserType } from "@/src/components/ProtectedRoute";
import { useAuth, type UserType } from "@/src/context/AuthContext";
import { ApiError } from "@/src/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("SELLER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await register({ name, phoneNumber, password, userType });
      router.push(dashboardByUserType[user.userType]);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as
          | { error?: string; details?: { message: string }[] }
          | undefined;
        setError(
          data?.details?.[0]?.message ||
            data?.error ||
            "Could not create your account. Please try again.",
        );
      } else {
        setError("Could not create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f1] px-6 py-8 text-[#123526]">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <section>
          <BrandMark />
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-[#1d9e75]">
            Join the marketplace
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[#0b2318] sm:text-5xl">
            Start with the right account for how you move materials.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#5e7569]">
            Sellers post recyclable supply. Buyers discover relevant listings.
            Sprint 1 sets up the entry flow; Sprint 2 adds the working market.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              ["Seller", "Post recyclable materials"],
              ["Buyer", "Source nearby supply"],
            ].map(([title, body]) => (
              <div
                className="rounded-lg border border-[#d8e4dd] bg-white p-5 shadow-sm"
                key={title}
              >
                <p className="font-semibold text-[#0b2318]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#5e7569]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#d8e4dd] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-[#0b2318]">
            Create account
          </h2>
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold">Name</span>
              <input
                className="mt-2 h-12 w-full rounded-md border border-[#bfd2c9] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#1d9e75] focus:bg-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
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
            <fieldset>
              <legend className="text-sm font-semibold">Account type</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["SELLER", "BUYER"] as UserType[]).map((type) => (
                  <label
                    className="flex h-12 items-center justify-center rounded-md border border-[#bfd2c9] bg-[#fbfcfa] text-sm font-semibold transition has-[:checked]:border-[#1d9e75] has-[:checked]:bg-[#e7f6ef] has-[:checked]:text-[#0b684d]"
                    key={type}
                  >
                    <input
                      className="sr-only"
                      checked={userType === type}
                      onChange={() => setUserType(type)}
                      name="userType"
                      type="radio"
                    />
                    {type === "SELLER" ? "Seller" : "Buyer"}
                  </label>
                ))}
              </div>
            </fieldset>
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
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-[#5e7569]">
            Already have an account?{" "}
            <Link className="font-semibold text-[#0b684d]" href="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
