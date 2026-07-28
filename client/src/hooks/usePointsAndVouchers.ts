"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/src/lib/api";

// ---------- types ----------

export type BrowseCollectionPoint = {
  id: string;
  name: string;
  address: string;
  areaName?: string;
  materials: string[];
  isActive: boolean;
};

export type PointsBalance = {
  id: string;
  points: number;
  collectionPoint: {
    id: string;
    name: string;
    address: string;
    areaName?: string;
    materials: string[];
  };
};

export type Voucher = {
  id: string;
  code: string;
  value: number;
  partner: string;
  pointsUsed: number;
  redeemed: boolean;
  createdAt: string;
};

// ---------- API response shapes ----------

type CollectionPointsResponse = { collectionPoints: BrowseCollectionPoint[] };
type BalancesResponse = { balances: PointsBalance[] };
type VouchersResponse = { vouchers: Voucher[] };
type RedeemResponse = { voucher: Voucher; message: string };

// ---------- hook ----------

export function usePointsAndVouchers(userId: string | undefined) {
  const [collectionPoints, setCollectionPoints] = useState<BrowseCollectionPoint[]>([]);
  const [loadingCollectionPoints, setLoadingCollectionPoints] = useState(true);

  const [balances, setBalances] = useState<PointsBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  // per-action feedback
  const [registeringAt, setRegisteringAt] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [redeemingAt, setRedeemingAt] = useState<string | null>(null);
  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [newVoucherCode, setNewVoucherCode] = useState<string | null>(null);

  // ---------- loaders ----------

  const loadCollectionPoints = useCallback(async () => {
    try {
      setLoadingCollectionPoints(true);
      const res = await apiClient.get<CollectionPointsResponse>(
        "/points/collection-points",
      );
      setCollectionPoints(res.collectionPoints);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoadingCollectionPoints(false);
    }
  }, []);

  const loadBalances = useCallback(async () => {
    try {
      setLoadingBalances(true);
      const res = await apiClient.get<BalancesResponse>("/points/balances");
      setBalances(res.balances);
    } catch {
      // silently fail
    } finally {
      setLoadingBalances(false);
    }
  }, []);

  const loadVouchers = useCallback(async () => {
    try {
      setLoadingVouchers(true);
      const res = await apiClient.get<VouchersResponse>("/dropoffs/vouchers");
      setVouchers(res.vouchers);
    } catch {
      // silently fail
    } finally {
      setLoadingVouchers(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || userId.startsWith("preview-")) {
      setLoadingCollectionPoints(false);
      setLoadingBalances(false);
      setLoadingVouchers(false);
      return;
    }
    void loadCollectionPoints();
    void loadBalances();
    void loadVouchers();
  }, [userId, loadCollectionPoints, loadBalances, loadVouchers]);

  // ---------- actions ----------

  async function registerAtCollectionPoint(collectionPointId: string) {
    setRegisteringAt(collectionPointId);
    setRegisterMessage("");
    setRegisterError("");
    try {
      await apiClient.post("/points/register", { collectionPointId });
      setRegisterMessage("Registered successfully.");
      await loadBalances();
    } catch (err) {
      // 409 / already registered is handled gracefully — treat as success
      if (err instanceof ApiError && err.status === 409) {
        setRegisterMessage("You're already registered here.");
      } else {
        setRegisterError("Could not register. Try again.");
      }
    } finally {
      setRegisteringAt(null);
    }
  }

  async function redeemPoints(collectionPointId: string, pointsToRedeem: number, currentPoints: number) {
    setRedeemMessage("");
    setRedeemError("");
    setNewVoucherCode(null);

    if (currentPoints < 100) {
      setRedeemError(
        `You need at least 100 points to redeem. You have ${currentPoints} pts at this collection point.`,
      );
      return;
    }

    setRedeemingAt(collectionPointId);
    try {
      const res = await apiClient.post<RedeemResponse>("/points/redeem", {
        collectionPointId,
        pointsToRedeem,
      });
      setNewVoucherCode(res.voucher.code);
      setRedeemMessage(
        `Voucher generated! Show code ${res.voucher.code} in-store. Value: KES ${res.voucher.value}.`,
      );
      await loadBalances();
      await loadVouchers();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { error?: string } | null;
        setRedeemError(data?.error ?? "Could not redeem points. Try again.");
      } else {
        setRedeemError("Could not redeem points. Try again.");
      }
    } finally {
      setRedeemingAt(null);
    }
  }

  return {
    // data
    collectionPoints,
    loadingCollectionPoints,
    balances,
    loadingBalances,
    vouchers,
    loadingVouchers,
    // register
    registeringAt,
    registerMessage,
    registerError,
    registerAtCollectionPoint,
    // redeem
    redeemingAt,
    redeemMessage,
    redeemError,
    newVoucherCode,
    redeemPoints,
    // manual refresh
    loadBalances,
    loadVouchers,
  };
}
