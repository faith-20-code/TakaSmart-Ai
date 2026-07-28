"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/src/lib/api";

// ---------- types ----------

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data?: {
    listingId?: string;
    interestId?: string;
    sellerPhone?: string;
  };
  createdAt: string;
};

type NotificationsResponse = {
  notifications: Notification[];
};

// ---------- hook ----------

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    if (!userId || userId.startsWith("preview-")) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get<NotificationsResponse>(
        "/users/notifications",
      );
      setNotifications(res.notifications);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await apiClient.patch(`/users/notifications/${id}/read`);
    } catch {
      // revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
      );
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiClient.patch("/users/notifications/read-all");
    } catch {
      // reload to get real state
      await load();
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    reload: load,
  };
}
