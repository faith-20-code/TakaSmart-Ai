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

export type UserType = "SELLER" | "BUYER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  phoneNumber: string;
  userType: UserType;
  verified?: boolean;
};

type LoginInput = {
  phoneNumber: string;
  password: string;
};

type RegisterInput = LoginInput & {
  name: string;
  userType: UserType;
};

type AuthResponse = {
  user: User;
};

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
      const response = await apiClient.get<AuthResponse>("/auth/me");
      setUser(response.user);
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
    const response = await apiClient.post<AuthResponse>("/auth/login", input);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await apiClient.post<AuthResponse>("/auth/register", input);
    setUser(response.user);
    return response.user;
  }, []);

  const previewAs = useCallback((userType: UserType) => {
    const previewUser: User = {
      id: `preview-${userType.toLowerCase()}`,
      name:
        userType === "SELLER"
          ? "Preview Seller"
          : userType === "BUYER"
            ? "Preview Buyer"
            : "Preview Admin",
      phoneNumber: "+254700000000",
      userType,
      verified: true,
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
