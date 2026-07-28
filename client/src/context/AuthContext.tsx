"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiClient } from "@/src/lib/api";

// ---------- types ----------

// Frontend UserType: PERSONAL and BUSINESS replace SELLER.
// The backend stores SELLER in the DB and returns it from /me, but we
// normalise it to PERSONAL or BUSINESS here using sellerProfile.accountType
// so the rest of the app never needs to know about the DB-level SELLER value.
export type UserType = "PERSONAL" | "BUSINESS" | "BUYER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  phoneNumber: string;
  userType: UserType;
  verified?: boolean;
  sellerProfile?: {
    accountType: "PERSONAL" | "BUSINESS";
    businessName?: string;
    points: number;
    uniqueCode?: string;
  };
  buyerProfile?: {
    companyName: string;
  };
};

// Raw shape returned by the backend — userType is still the DB enum
type RawUser = Omit<User, "userType"> & {
  userType: "SELLER" | "BUYER" | "ADMIN";
};

// Map SELLER → PERSONAL or BUSINESS using sellerProfile.accountType
function normaliseUser(raw: RawUser): User {
  let userType: UserType;
  if (raw.userType === "SELLER") {
    userType = raw.sellerProfile?.accountType === "BUSINESS"
      ? "BUSINESS"
      : "PERSONAL";
  } else {
    userType = raw.userType as "BUYER" | "ADMIN";
  }
  return { ...raw, userType };
}

// ---------- inputs ----------

type LoginInput = {
  phoneNumber: string;
  password: string;
};

type RegisterInput = LoginInput & {
  name: string;
  userType: UserType;
  businessName?: string;
  registrationNo?: string;
};

// What the API actually returns
type RawAuthResponse = {
  user: RawUser;
};

// ---------- context ----------

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  previewAs: (userType: UserType) => User;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<RawAuthResponse>("/auth/me");
      setUser(normaliseUser(response.user));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        return;
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshUser();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await apiClient.post<RawAuthResponse>("/auth/login", input);
    const normalised = normaliseUser(response.user);
    setUser(normalised);
    return normalised;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    // Backend accepts PERSONAL / BUSINESS / BUYER directly
    const response = await apiClient.post<RawAuthResponse>("/auth/register", input);
    const normalised = normaliseUser(response.user);
    setUser(normalised);
    return normalised;
  }, []);

  const previewAs = useCallback((userType: UserType): User => {
    const isPersonal = userType === "PERSONAL";
    const isBusiness = userType === "BUSINESS";
    const isSeller = isPersonal || isBusiness;

    const previewUser: User = {
      id: `preview-${userType.toLowerCase()}`,
      name: `Preview ${userType.charAt(0) + userType.slice(1).toLowerCase()}`,
      phoneNumber: "+254700000000",
      userType,
      verified: true,
      sellerProfile: isSeller
        ? {
            accountType: isBusiness ? "BUSINESS" : "PERSONAL",
            businessName: isBusiness ? "Demo Business Ltd" : undefined,
            points: 0,
            uniqueCode: isPersonal ? "TK-0000" : undefined,
          }
        : undefined,
      buyerProfile: userType === "BUYER"
        ? { companyName: "Demo Buyer Co." }
        : undefined,
    };
    setUser(previewUser);
    return previewUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!user?.id.startsWith("preview-")) {
        await apiClient.post("/auth/logout");
      }
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router, user]);

  const value = useMemo(
    () => ({ user, loading, login, register, previewAs, logout, refreshUser }),
    [user, loading, login, register, previewAs, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
