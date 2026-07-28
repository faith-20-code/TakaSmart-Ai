"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type User, type UserType } from "@/src/context/AuthContext";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] px-6 text-[#123526]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1d9e75] border-t-transparent" />
    </div>
  );
}

export function getDashboardPath(user: User): string {
  if (user.userType === "BUYER") return "/buyer";
  if (user.userType === "ADMIN") return "/admin";
  if (user.userType === "BUSINESS") return "/dashboard/business";
  return "/dashboard/personal";
}

export function ProtectedRoute({
  allowedUserType,
  children,
}: {
  allowedUserType: UserType;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const mismatch = !!user && user.userType !== allowedUserType;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (mismatch) router.replace(getDashboardPath(user));
  }, [loading, mismatch, router, user]);

  if (loading || !user || mismatch) return <LoadingScreen />;

  return <>{children}</>;
}
