"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
  type SellerAccountType,
  type User,
  type UserType,
} from "@/src/context/AuthContext";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] px-6 text-[#123526]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1d9e75] border-t-transparent" />
    </div>
  );
}

/**
 * Resolves where a user should land after login/preview.
 * Sellers split further by sellerProfile.accountType — Business sellers
 * go to /dashboard/business, everyone else (including a Personal seller,
 * or a seller with no sellerProfile loaded yet) goes to /dashboard/personal.
 */
export function getDashboardPath(user: User): string {
  if (user.userType === "SELLER" && user.sellerProfile) {
    return user.sellerProfile?.accountType === "BUSINESS"
      ? "/dashboard/business"
      : "/dashboard/personal";
  }
  if (user.userType === "BUYER") {
    return "/buyer";
  }
  return "/admin";
}

export function ProtectedRoute({
  allowedUserType,
  allowedAccountType,
  children,
}: {
  allowedUserType: UserType;
  // Only checked when allowedUserType is "SELLER". Omit to allow either
  // account type through (e.g. a shared seller-only layout).
  allowedAccountType?: SellerAccountType;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const userTypeMismatch = !!user && user.userType !== allowedUserType;
  const accountTypeMismatch =
    !!user &&
    !userTypeMismatch &&
    allowedUserType === "SELLER" &&  
    allowedAccountType !== undefined &&
    user.sellerProfile?.accountType !== allowedAccountType;
  const mismatch = userTypeMismatch || accountTypeMismatch;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (mismatch) {
      router.replace(getDashboardPath(user));
    }
  }, [loading, mismatch, router, user]);

  if (loading || !user || mismatch) {
    return <LoadingScreen />;
  }

  return children;
}