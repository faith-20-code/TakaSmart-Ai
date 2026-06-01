"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserType } from "@/src/context/AuthContext";

const dashboardByUserType: Record<UserType, string> = {
  SELLER: "/seller",
  BUYER: "/buyer",
  ADMIN: "/admin",
};

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] px-6 text-[#123526]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1d9e75] border-t-transparent" />
    </div>
  );
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

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.userType !== allowedUserType) {
      router.replace(dashboardByUserType[user.userType]);
    }
  }, [allowedUserType, loading, router, user]);

  if (loading || !user || user.userType !== allowedUserType) {
    return <LoadingScreen />;
  }

  return children;
}

export { dashboardByUserType };
