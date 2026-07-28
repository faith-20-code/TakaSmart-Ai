"use client";

import { useCallback, useState } from "react";
import { apiClient, ApiError } from "@/src/lib/api";

// ---------- types ----------

export type ExpressInterest = {
  id: string;
  listingId: string;
  buyerId: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  buyer: {
    name: string;
    phoneNumber: string;
    buyerProfile: {
      companyName: string;
      materialsAccepted: string[];
    };
  };
};

type InterestsResponse = {
  interests: ExpressInterest[];
};

type ActionResponse = {
  interest: ExpressInterest;
};

// ---------- hook ----------

export function useListingInterests() {
  // keyed by listingId so multiple listings can be open at once
  const [interestsByListing, setInterestsByListing] = useState<
    Record<string, ExpressInterest[]>
  >({});
  const [loadingListing, setLoadingListing] = useState<Record<string, boolean>>(
    {},
  );
  const [actingOn, setActingOn] = useState<string | null>(null); // interestId
  const [actionError, setActionError] = useState<Record<string, string>>({});

  const loadInterests = useCallback(async (listingId: string) => {
    setLoadingListing((prev) => ({ ...prev, [listingId]: true }));
    try {
      const res = await apiClient.get<InterestsResponse>(
        `/listings/${listingId}/interests`,
      );
      setInterestsByListing((prev) => ({
        ...prev,
        [listingId]: res.interests,
      }));
    } catch {
      setInterestsByListing((prev) => ({ ...prev, [listingId]: [] }));
    } finally {
      setLoadingListing((prev) => ({ ...prev, [listingId]: false }));
    }
  }, []);

  async function updateInterestStatus(
    listingId: string,
    interestId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    setActingOn(interestId);
    setActionError((prev) => ({ ...prev, [interestId]: "" }));
    try {
      const res = await apiClient.patch<ActionResponse>(
        `/listings/${listingId}/interest/${interestId}`,
        { status },
      );
      // update in place
      setInterestsByListing((prev) => ({
        ...prev,
        [listingId]: (prev[listingId] ?? []).map((i) =>
          i.id === interestId ? res.interest : i,
        ),
      }));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? ((err.data as { error?: string })?.error ?? "Action failed.")
          : "Action failed.";
      setActionError((prev) => ({ ...prev, [interestId]: msg }));
    } finally {
      setActingOn(null);
    }
  }

  return {
    interestsByListing,
    loadingListing,
    actingOn,
    actionError,
    loadInterests,
    updateInterestStatus,
  };
}
